const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} = require('../Controllers/cartController');
const protect = require('../Middleware/authMiddleware');
const allowRoles = require('../Middleware/roleMiddleware');
/**
 * Cart Routes
 * All routes require authentication and user role
 */

// Apply authentication and authorization to all cart routes
router.use(protect);
router.use(allowRoles('user'));

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


