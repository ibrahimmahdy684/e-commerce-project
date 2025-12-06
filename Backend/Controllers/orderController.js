const Order = require('../Models/orderModel');
const Cart = require('../Models/cartModel');
const Product = require('../Models/ProductModel');
const User = require('../Models/userModel');
const ResponseHandler = require('../utils/responseHandler');
const {
  validatePointsUsage,
  calculateOrderTotal
} = require('../utils/helpers');

/**
 * @desc    Create order from cart (Checkout)
 * @route   POST /api/orders
 * @access  Private (user)
 */
const createOrder = async (req, res, next) => {
  try {
    const { payment_method, points_to_use = 0 } = req.body;

    // Fail fast - validate payment method
    if (!payment_method || !['cash', 'credit'].includes(payment_method)) {
      return ResponseHandler.validationError(res, [
        'Valid payment method is required (cash or credit)'
      ]);
    }

    // Get user's cart with products
    const cart = await Cart.findOne({ user_id: req.user._id })
      .populate('item_list.product_id');

    // Fail fast - empty cart
    if (!cart || cart.item_list.length === 0) {
      return ResponseHandler.error(res, 'Cart is empty', 400);
    }

    // Validate cart and calculate total - Imperative approach
    let cartTotal = 0;
    const unavailableProducts = [];

    for (const item of cart.item_list) {
      const product = item.product_id;

      // Check product existence
      if (!product) {
        unavailableProducts.push('Product no longer exists');
        continue;
      }

      // Check product status
      if (product.status !== 'approved') {
        unavailableProducts.push(`${product.name} is not available`);
        continue;
      }

      // Check stock availability
      if (product.quantity < item.quantity) {
        unavailableProducts.push(
          `${product.name} - only ${product.quantity} available`
        );
        continue;
      }

      cartTotal += product.price * item.quantity;
    }

    // Fail fast - unavailable products
    if (unavailableProducts.length > 0) {
      return ResponseHandler.error(
        res,
        'Some products are unavailable',
        400
      );
    }

    // Get user and validate points
    const user = await User.findById(req.user._id);

    try {
      validatePointsUsage(points_to_use, user.points, cartTotal);
    } catch (error) {
      return ResponseHandler.error(res, error.message, 400);
    }

    // Calculate order totals
    const orderCalculation = calculateOrderTotal(cartTotal, points_to_use);

    // Update product quantities - Imperative approach
    for (const item of cart.item_list) {
      await Product.findByIdAndUpdate(
        item.product_id._id,
        { $inc: { quantity: -item.quantity } }
      );
    }

    // Update user points
    const newPointsBalance = user.points - orderCalculation.pointsUsed + orderCalculation.pointsEarned;
    await User.findByIdAndUpdate(req.user._id, { points: newPointsBalance });

    // Create snapshot of cart items for order
    const orderItems = cart.item_list.map(item => ({
      product_id: item.product_id._id,
      product_name: item.product_id.name,
      price: item.product_id.price,
      quantity: item.quantity
    }));

    // Create order
    const order = await Order.create({
      user_id: req.user._id,
      cart_id: cart._id,
      items: orderItems,
      total_amount: orderCalculation.finalAmount,
      payment_method,
      status: 'pending'
    });

    // Clear cart
    await cart.clearCart();

    return ResponseHandler.success(
      res,
      {
        order_id: order._id,
        total_amount: orderCalculation.finalAmount,
        points_used: orderCalculation.pointsUsed,
        points_discount: orderCalculation.discount,
        points_earned: orderCalculation.pointsEarned,
        new_points_balance: newPointsBalance,
        status: order.status,
        payment_method: order.payment_method,
        placed_at: order.placed_at
      },
      'Order placed successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's order history
 * @route   GET /api/orders
 * @access  Private (user)
 */
const getUserOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { user_id: req.user._id };
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
      .sort({ placed_at: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Order.countDocuments(query);

    return ResponseHandler.success(res, {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }, 'Orders retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get order details
 * @route   GET /api/orders/:order_id
 * @access  Private
 */
const getOrderDetails = async (req, res, next) => {
  try {
    const { order_id } = req.params;

    const order = await Order.findById(order_id)
      .populate('user_id', 'name email phone address')
      .populate('items.product_id', 'name price vendorId');

    // Fail fast - order not found
    if (!order) {
      return ResponseHandler.notFound(res, 'Order');
    }

    // Fail fast - authorization check for users
    if (req.user.role === 'user' && order.user_id._id.toString() !== req.user._id.toString()) {
      return ResponseHandler.forbidden(res, 'Not authorized to view this order');
    }

    return ResponseHandler.success(res, order, 'Order retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update order status
 * @route   PUT /api/orders/:order_id/status
 * @access  Private (Vendor/Admin)
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { order_id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    // Fail fast - validate status
    if (!status || !validStatuses.includes(status)) {
      return ResponseHandler.validationError(res, [
        `Status must be one of: ${validStatuses.join(', ')}`
      ]);
    }

    const order = await Order.findById(order_id);

    // Fail fast - order not found
    if (!order) {
      return ResponseHandler.notFound(res, 'Order');
    }

    order.status = status;
    await order.save();

    return ResponseHandler.success(res, {
      order_id: order._id,
      status: order.status
    }, 'Order status updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get orders based on user role (Smart routing)
 * @route   GET /api/orders
 * @access  Private (User/Admin/Vendor)
 * @info    Returns user's orders for 'user' role, all orders for 'admin' role, vendor-specific orders for 'vendor' role
 */
const getOrdersBasedOnRole = async (req, res, next) => {
  try {
    // Route to appropriate handler based on user role
    if (req.user.role === 'admin') {
      return getAllOrders(req, res, next);
    } else if (req.user.role === 'vendor') {
      return getVendorOrders(req, res, next);
    } else {
      return getUserOrders(req, res, next);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all orders (Admin)
 * @route   GET /api/orders (when role=admin)
 * @access  Private (Admin)
 */
const getAllOrders = async (req, res, next) => {
  try {
    const { status, user_id, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (user_id) query.user_id = user_id;

    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
      .populate('user_id', 'name email phone')
      .sort({ placed_at: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Order.countDocuments(query);

    return ResponseHandler.success(res, {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }, 'Orders retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get vendor orders (only orders containing vendor's products)
 * @route   GET /api/orders (when role=vendor)
 * @access  Private (Vendor)
 */
const getVendorOrders = async (req, res, next) => {
  try {
    const vendorId = req.user._id;
    const { status, page = 1, limit = 20 } = req.query;

    // Get all vendor's products
    const vendorProducts = await Product.find({ vendorId }).select('_id');
    const vendorProductIds = vendorProducts.map(p => p._id.toString());

    // Build base query
    const query = {};
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    // Find all orders matching the base query
    const allOrders = await Order.find(query)
      .populate('user_id', 'name email phone')
      .populate('items.product_id', 'vendorId')
      .sort({ placed_at: -1 });

    // Filter orders that contain vendor's products
    const vendorOrders = allOrders.filter(order =>
      order.items.some(item =>
        item.product_id && item.product_id.vendorId &&
        item.product_id.vendorId.toString() === vendorId.toString()
      )
    );

    // Apply pagination to filtered results
    const total = vendorOrders.length;
    const paginatedOrders = vendorOrders.slice(skip, skip + parseInt(limit));

    return ResponseHandler.success(res, {
      orders: paginatedOrders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }, 'Vendor orders retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get statistics based on user role (Smart routing)
 * @route   GET /api/orders/statistics
 * @access  Private (Admin/Vendor)
 * @info    Returns all statistics for 'admin', vendor-specific for 'vendor'
 */
const getStatisticsBasedOnRole = async (req, res, next) => {
  try {
    // Route to appropriate handler based on user role
    if (req.user.role === 'admin') {
      return getStatistics(req, res, next);
    } else if (req.user.role === 'vendor') {
      return getVendorStatistics(req, res, next);
    } else {
      return ResponseHandler.forbidden(res, 'Access to statistics not allowed for this role');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get platform statistics (Admin)
 * @route   GET /api/orders/statistics (when role=admin)
 * @access  Private (Admin)
 */
const getStatistics = async (req, res, next) => {
  try {
    // Declarative approach using Promise.all
    const [
      totalOrders,
      pendingOrders,
      completedOrders,
      revenueData,
      ordersByStatus,
      recentOrders
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'delivered' }),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total_amount' } } }
      ]),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Order.find()
        .populate('user_id', 'name email')
        .sort({ placed_at: -1 })
        .limit(10)
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    return ResponseHandler.success(res, {
      total_orders: totalOrders,
      pending_orders: pendingOrders,
      completed_orders: completedOrders,
      total_revenue: totalRevenue,
      orders_by_status: ordersByStatus,
      recent_orders: recentOrders
    }, 'Statistics retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get vendor statistics (only their products)
 * @route   GET /api/orders/statistics (when role=vendor)
 * @access  Private (Vendor)
 */
const getVendorStatistics = async (req, res, next) => {
  try {
    const vendorId = req.user._id;

    // Get all vendor's products
    const vendorProducts = await Product.find({ vendorId }).select('_id');
    const vendorProductIds = vendorProducts.map(p => p._id.toString());

    // Find orders containing vendor's products
    const allOrders = await Order.find()
      .populate('items.product_id', 'vendorId');

    // Filter orders that have at least one vendor product
    const ordersWithVendorProducts = allOrders.filter(order =>
      order.items.some(item =>
        item.product_id && item.product_id.vendorId &&
        item.product_id.vendorId.toString() === vendorId.toString()
      )
    );

    // Calculate revenue from vendor's products only
    let totalRevenue = 0;
    let totalProductsSold = 0;
    const ordersByStatus = {};

    ordersWithVendorProducts.forEach(order => {
      if (order.status !== 'cancelled') {
        // Count only vendor's products in each order
        order.items.forEach(item => {
          if (item.product_id && item.product_id.vendorId &&
              item.product_id.vendorId.toString() === vendorId.toString()) {
            totalRevenue += item.price * item.quantity;
            totalProductsSold += item.quantity;
          }
        });
      }

      // Track orders by status
      ordersByStatus[order.status] = (ordersByStatus[order.status] || 0) + 1;
    });

    const pendingOrders = ordersByStatus.pending || 0;
    const completedOrders = ordersByStatus.delivered || 0;

    return ResponseHandler.success(res, {
      total_orders: ordersWithVendorProducts.length,
      pending_orders: pendingOrders,
      completed_orders: completedOrders,
      total_revenue: totalRevenue,
      total_products_sold: totalProductsSold,
      orders_by_status: Object.entries(ordersByStatus).map(([status, count]) => ({
        _id: status,
        count
      }))
    }, 'Vendor statistics retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get sales report based on user role (Smart routing)
 * @route   GET /api/orders/sales-report
 * @access  Private (Admin/Vendor)
 * @info    Returns all sales for 'admin', vendor-specific for 'vendor'
 */
const getSalesReportBasedOnRole = async (req, res, next) => {
  try {
    // Route to appropriate handler based on user role
    if (req.user.role === 'admin') {
      return getSalesReport(req, res, next);
    } else if (req.user.role === 'vendor') {
      return getVendorSalesReport(req, res, next);
    } else {
      return ResponseHandler.forbidden(res, 'Access to sales reports not allowed for this role');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get sales report (Admin)
 * @route   GET /api/orders/sales-report (when role=admin)
 * @access  Private (Admin)
 */
const getSalesReport = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;

    const query = { status: { $ne: 'cancelled' } };

    // Build date query
    if (start_date || end_date) {
      query.placed_at = {};
      if (start_date) query.placed_at.$gte = new Date(start_date);
      if (end_date) query.placed_at.$lte = new Date(end_date);
    }

    const orders = await Order.find(query).populate('user_id', 'name email');

    // Declarative calculations using reduce
    const totalSales = orders.reduce((sum, order) => sum + order.total_amount, 0);
    const averageOrderValue = orders.length > 0 ? totalSales / orders.length : 0;

    // Declarative aggregations using Promise.all
    const [salesByPaymentMethod, dailySales] = await Promise.all([
      Order.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$payment_method',
            count: { $sum: 1 },
            total: { $sum: '$total_amount' }
          }
        }
      ]),
      start_date && end_date
        ? Order.aggregate([
          { $match: query },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$placed_at' } },
              count: { $sum: 1 },
              total: { $sum: '$total_amount' }
            }
          },
          { $sort: { _id: 1 } }
        ])
        : []
    ]);

    return ResponseHandler.success(res, {
      period: {
        start: start_date || 'all time',
        end: end_date || 'present'
      },
      summary: {
        total_orders: orders.length,
        total_sales: totalSales,
        average_order_value: averageOrderValue
      },
      sales_by_payment_method: salesByPaymentMethod,
      daily_sales: dailySales
    }, 'Sales report generated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get vendor sales report (only their products)
 * @route   GET /api/orders/sales-report (when role=vendor)
 * @access  Private (Vendor)
 */
const getVendorSalesReport = async (req, res, next) => {
  try {
    const vendorId = req.user._id;
    const { start_date, end_date } = req.query;

    const query = { status: { $ne: 'cancelled' } };

    // Build date query
    if (start_date || end_date) {
      query.placed_at = {};
      if (start_date) query.placed_at.$gte = new Date(start_date);
      if (end_date) query.placed_at.$lte = new Date(end_date);
    }

    // Find all orders in the date range
    const orders = await Order.find(query)
      .populate('items.product_id', 'vendorId')
      .populate('user_id', 'name email');

    // Filter and calculate sales for vendor's products only
    let totalSales = 0;
    let totalOrders = 0;
    let totalProductsSold = 0;
    const salesByPaymentMethod = {};
    const dailySalesMap = {};

    orders.forEach(order => {
      let vendorSalesInOrder = 0;
      let hasVendorProduct = false;

      // Calculate sales from vendor's products in this order
      order.items.forEach(item => {
        if (item.product_id && item.product_id.vendorId &&
            item.product_id.vendorId.toString() === vendorId.toString()) {
          const itemTotal = item.price * item.quantity;
          vendorSalesInOrder += itemTotal;
          totalProductsSold += item.quantity;
          hasVendorProduct = true;
        }
      });

      if (hasVendorProduct) {
        totalSales += vendorSalesInOrder;
        totalOrders++;

        // Track by payment method
        if (!salesByPaymentMethod[order.payment_method]) {
          salesByPaymentMethod[order.payment_method] = { count: 0, total: 0 };
        }
        salesByPaymentMethod[order.payment_method].count++;
        salesByPaymentMethod[order.payment_method].total += vendorSalesInOrder;

        // Track daily sales
        if (start_date && end_date) {
          const dateKey = order.placed_at.toISOString().split('T')[0];
          if (!dailySalesMap[dateKey]) {
            dailySalesMap[dateKey] = { count: 0, total: 0 };
          }
          dailySalesMap[dateKey].count++;
          dailySalesMap[dateKey].total += vendorSalesInOrder;
        }
      }
    });

    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Convert maps to arrays
    const salesByPaymentMethodArray = Object.entries(salesByPaymentMethod).map(([method, data]) => ({
      _id: method,
      count: data.count,
      total: data.total
    }));

    const dailySales = Object.entries(dailySalesMap)
      .map(([date, data]) => ({
        _id: date,
        count: data.count,
        total: data.total
      }))
      .sort((a, b) => a._id.localeCompare(b._id));

    return ResponseHandler.success(res, {
      period: {
        start: start_date || 'all time',
        end: end_date || 'present'
      },
      summary: {
        total_orders: totalOrders,
        total_sales: totalSales,
        average_order_value: averageOrderValue,
        total_products_sold: totalProductsSold
      },
      sales_by_payment_method: salesByPaymentMethodArray,
      daily_sales: dailySales
    }, 'Vendor sales report generated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel a pending order and refund products & points
 * @route   DELETE /api/orders/:order_id/cancel
 * @access  Private (user)
 */
const cancelOrder = async (req, res, next) => {
  try {
    const { order_id } = req.params;

    const order = await Order.findById(order_id)
      .populate('user_id');

    // Fail fast - order not found
    if (!order) {
      return ResponseHandler.notFound(res, 'Order');
    }

    // Fail fast - authorization check
    if (order.user_id._id.toString() !== req.user._id.toString()) {
      return ResponseHandler.forbidden(res, 'Not authorized to cancel this order');
    }

    // Fail fast - order status check
    if (order.status !== 'pending') {
      return ResponseHandler.error(
        res,
        `Cannot cancel order with status '${order.status}'. Only pending orders can be cancelled.`,
        400
      );
    }

    // Restore product quantities
    if (order.items && order.items.length > 0) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product_id,
          { $inc: { quantity: item.quantity } }
        );
      }
    }

    // Calculate points refund (reverse the points calculation from order creation)
    const orderCalculation = calculateOrderTotal(order.total_amount, 0);
    const user = order.user_id;
    const refundedPoints = orderCalculation.pointsEarned;

    // Restore user points
    await User.findByIdAndUpdate(
      user._id,
      { $inc: { points: refundedPoints } }
    );

    // Update order status to cancelled
    order.status = 'cancelled';
    await order.save();

    return ResponseHandler.success(res, {
      order_id: order._id,
      status: order.status,
      refunded_amount: order.total_amount,
      refunded_points: refundedPoints,
      message: 'Order cancelled successfully. Products and points have been refunded.'
    }, 'Order cancelled successfully', 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderDetails,
  updateOrderStatus,
  getAllOrders,
  getVendorOrders,
  getOrdersBasedOnRole,
  getStatistics,
  getStatisticsBasedOnRole,
  getVendorStatistics,
  getSalesReport,
  getSalesReportBasedOnRole,
  getVendorSalesReport,
  cancelOrder
};


