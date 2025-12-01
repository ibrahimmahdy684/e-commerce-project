const Cart = require('../Models/cartModel');
const Product = require('../Models/ProductModel');
const ResponseHandler = require('../utils/responseHandler');

/**
 * @desc    Get user's cart with product details
 * @route   GET /api/cart
 * @access  Private (Buyer)
 */
const getCart = async (req, res, next) => {
  try {
    // Defensive: ensure authentication middleware set req.user
    if (!req.user) {
      return ResponseHandler.unauthorized(res, 'Authentication required');
    }
    let cart = await Cart.findOne({ user_id: req.user._id })
      .populate({
        path: 'item_list.product_id',
        select: 'name price quantity images status vendor_id',
        populate: {
          path: 'vendor_id',
          select: 'shop_name'
        }
      });

    // Create cart if doesn't exist
    if (!cart) {
      cart = await Cart.create({ user_id: req.user._id, item_list: [] });
    }

    // Calculate total using declarative approach (map/reduce)
    let total = 0;
    const items = cart.item_list
      .filter(item => item.product_id) // Remove deleted products
      .map(item => {
        const subtotal = item.product_id.price * item.quantity;
        total += subtotal;

        return {
          _id: item._id,
          product_id: item.product_id._id,
          product_name: item.product_id.name,
          price: item.product_id.price,
          quantity: item.quantity,
          available_quantity: item.product_id.quantity,
          subtotal,
          image: item.product_id.images[0] || null,
          vendor_name: item.product_id.vendor_id?.shop_name || 'Unknown',
          status: item.product_id.status
        };
      });

    return ResponseHandler.success(res, {
      cart_id: cart._id,
      items,
      total,
      items_count: items.length
    }, 'Cart retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add item to cart
 * @route   POST /api/cart
 * @access  Private (Buyer)
 */
const addToCart = async (req, res, next) => {
  try {
    // Defensive: ensure authentication middleware set req.user
    if (!req.user) {
      return ResponseHandler.unauthorized(res, 'Authentication required');
    }
    const { product_id, quantity } = req.body;

    // Fail fast - validation
    if (!product_id || !quantity) {
      return ResponseHandler.validationError(res, [
        'product_id and quantity are required'
      ]);
    }

    if (quantity < 1) {
      return ResponseHandler.validationError(res, [
        'Quantity must be at least 1'
      ]);
    }

    // Check if product exists and is approved
    const product = await Product.findById(product_id);

    // Fail fast - product not found
    if (!product) {
      return ResponseHandler.notFound(res, 'Product');
    }

    // Fail fast - product not approved
    if (product.status !== 'approved') {
      return ResponseHandler.error(res, 'Product is not available for purchase', 400);
    }

    // Fail fast - insufficient stock
    if (product.quantity < quantity) {
      return ResponseHandler.error(
        res,
        `Only ${product.quantity} items available in stock`,
        400
      );
    }

    // Get or create cart
    let cart = await Cart.findOne({ user_id: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user_id: req.user._id, item_list: [] });
    }

    // Add or update item
    await cart.addOrUpdateItem(product_id, quantity);

    return ResponseHandler.success(
      res,
      { cart_id: cart._id },
      'Item added to cart successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/cart/:item_id
 * @access  Private (Buyer)
 */
const updateCartItem = async (req, res, next) => {
  try {
    // Defensive: ensure authentication middleware set req.user
    if (!req.user) {
      return ResponseHandler.unauthorized(res, 'Authentication required');
    }
    const { item_id } = req.params;
    const { quantity } = req.body;

    // Fail fast - validation
    if (!quantity || quantity < 1) {
      return ResponseHandler.validationError(res, [
        'Quantity must be at least 1'
      ]);
    }

    const cart = await Cart.findOne({ user_id: req.user._id });

    // Fail fast - cart not found
    if (!cart) {
      return ResponseHandler.notFound(res, 'Cart');
    }

    const item = cart.item_list.id(item_id);

    // Fail fast - item not found
    if (!item) {
      return ResponseHandler.notFound(res, 'Item in cart');
    }

    // Check product availability
    const product = await Product.findById(item.product_id);

    // Fail fast - product not exists
    if (!product) {
      return ResponseHandler.error(res, 'Product no longer exists', 404);
    }

    // Fail fast - insufficient stock
    if (product.quantity < quantity) {
      return ResponseHandler.error(
        res,
        `Only ${product.quantity} items available in stock`,
        400
      );
    }

    await cart.updateItemQuantity(item_id, quantity);

    return ResponseHandler.success(res, null, 'Cart item updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/:item_id
 * @access  Private (Buyer)
 */
const removeFromCart = async (req, res, next) => {
  try {
    // Defensive: ensure authentication middleware set req.user
    if (!req.user) {
      return ResponseHandler.unauthorized(res, 'Authentication required');
    }
    const { item_id } = req.params;

    const cart = await Cart.findOne({ user_id: req.user._id });

    // Fail fast - cart not found
    if (!cart) {
      return ResponseHandler.notFound(res, 'Cart');
    }

    await cart.removeItem(item_id);

    return ResponseHandler.success(res, null, 'Item removed from cart successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Clear entire cart
 * @route   DELETE /api/cart
 * @access  Private (Buyer)
 */
const clearCart = async (req, res, next) => {
  try {
    // Defensive: ensure authentication middleware set req.user
    if (!req.user) {
      return ResponseHandler.unauthorized(res, 'Authentication required');
    }
    const cart = await Cart.findOne({ user_id: req.user._id });

    // Fail fast - cart not found
    if (!cart) {
      return ResponseHandler.notFound(res, 'Cart');
    }

    await cart.clearCart();

    return ResponseHandler.success(res, null, 'Cart cleared successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};


