// routes/orderRoutes.js

const express = require("express");
const router = express.Router();

const {
  createOrder,
  getUserOrders,
  getOrderDetails,
  updateOrderStatus,
  getAllOrders,
  getStatistics,
  getStatisticsBasedOnRole,
  getSalesReport,
  getSalesReportBasedOnRole,
  cancelOrder,
  getOrdersBasedOnRole,
} = require("../Controllers/orderController");

const protect = require("../Middleware/authMiddleware.js");
const allowRoles = require("../Middleware/roleMiddleware.js");

// Apply authentication to all routes
router.use(protect);

// ADMIN + VENDOR ROUTES (must come before generic routes to avoid conflicts)
router.get("/statistics", allowRoles("admin", "vendor"), getStatisticsBasedOnRole);
router.get("/sales-report", allowRoles("admin", "vendor"), getSalesReportBasedOnRole);

// SHARED ROUTES - Same path, different behavior based on role
router.post("/", allowRoles("user"), createOrder);
router.get("/", allowRoles("user", "admin", "vendor"), getOrdersBasedOnRole); // Smart route that checks role
router.delete("/:order_id/cancel", allowRoles("user"), cancelOrder);

// ORDER DETAILS - accessible by all authenticated users
router.get("/:order_id", getOrderDetails);

// VENDOR + ADMIN
router.put("/:order_id/status", allowRoles("vendor", "admin"), updateOrderStatus);

module.exports = router;
