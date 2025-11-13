const Order = require('../Models/orderModel');
const Cart = require('../Models/cartModel');
const Product = require('../Models/productModel');
const User = require('../Models/userModel');
const ResponseHandler = require('../utils/responseHandler');
const {
  validatePointsUsage,
  calculateOrderTotal
} = require('../utils/helpers');

/**
 * @desc    Create order from cart (Checkout)
 * @route   POST /api/orders
 * @access  Private (Buyer)
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

    // Create order
    const order = await Order.create({
      user_id: req.user._id,
      cart_id: cart._id,
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
 * @access  Private (Buyer)
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
      .populate('user_id', 'full_name email phone address')
      .populate({
        path: 'cart_id',
        populate: {
          path: 'item_list.product_id',
          select: 'name price images vendor_id',
          populate: {
            path: 'vendor_id',
            select: 'shop_name'
          }
        }
      });

    // Fail fast - order not found
    if (!order) {
      return ResponseHandler.notFound(res, 'Order');
    }

    // Fail fast - authorization check for buyers
    if (req.user.role === 'buyer' && order.user_id._id.toString() !== req.user._id.toString()) {
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
 * @desc    Get all orders (Admin)
 * @route   GET /api/admin/orders
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
      .populate('user_id', 'full_name email phone')
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
 * @desc    Get platform statistics
 * @route   GET /api/admin/statistics
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
        .populate('user_id', 'full_name email')
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
 * @desc    Get sales report
 * @route   GET /api/admin/sales-report
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

    const orders = await Order.find(query).populate('user_id', 'full_name email');

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

module.exports = {
  createOrder,
  getUserOrders,
  getOrderDetails,
  updateOrderStatus,
  getAllOrders,
  getStatistics,
  getSalesReport
};


