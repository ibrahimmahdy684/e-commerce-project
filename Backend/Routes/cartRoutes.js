const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} = require('../Controllers/cartController');
const { protect, authorize } = require('../middleware/authMiddleware');

/**
 * Cart Routes
 * All routes require authentication and buyer role
 */

// Apply authentication and authorization to all cart routes
router.use(protect);
router.use(authorize('buyer'));

// @route   GET /api/cart
router.get('/', getCart);

// @route   POST /api/cart
router.post('/', addToCart);

// @route   PUT /api/cart/:item_id
router.put('/:item_id', updateCartItem);

// @route   DELETE /api/cart/:item_id
router.delete('/:item_id', removeFromCart);

// @route   DELETE /api/cart
router.delete('/', clearCart);

module.exports = router;


