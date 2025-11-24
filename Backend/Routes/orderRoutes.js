const express = require('express');
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getOrderDetails,
  updateOrderStatus,
  getAllOrders,
  getStatistics,
  getSalesReport
} = require('../Controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

/**
 * Order Routes
 * Mixed access levels based on role
 */

// Apply authentication to all routes
router.use(protect);

// user Routes
// @route   POST /api/orders
router.post('/', authorize('user'), createOrder);

// @route   GET /api/orders
router.get('/', authorize('user'), getUserOrders);

// Shared Routes
// @route   GET /api/orders/:order_id
router.get('/:order_id', getOrderDetails);

// Vendor/Admin Routes
// @route   PUT /api/orders/:order_id/status
// + user -------------------------------------------------------------------------------------------
router.put('/:order_id/status', authorize('vendor', 'admin'), updateOrderStatus);

// Admin Only Routes
// @route   GET /api/admin/orders
router.get('/admin/orders', authorize('admin'), getAllOrders);

// @route   GET /api/admin/statistics
router.get('/admin/statistics', authorize('admin'), getStatistics);

// @route   GET /api/admin/sales-report
router.get('/admin/sales-report', authorize('admin'), getSalesReport);

module.exports = router;

