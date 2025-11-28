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
  getSalesReport,
  cancelOrder,
} = require("../Controllers/orderController");

const protect = require("../Middleware/authMiddleware.js");
const allowRoles = require("../Middleware/roleMiddleware.js");

// Apply authentication to all routes
router.use(protect);

// USER ROUTES
router.post("/", allowRoles("user"), createOrder);
router.get("/", allowRoles("user"), getUserOrders);
router.delete("/:order_id/cancel", allowRoles("user"), cancelOrder);

// SHARED ROUTES
router.get("/:order_id", getOrderDetails);

// VENDOR + ADMIN
router.put("/:order_id/status", allowRoles("vendor", "admin"), updateOrderStatus);

// ADMIN ONLY ROUTES
router.get("/admin/orders", allowRoles("admin"), getAllOrders);
router.get("/admin/statistics", allowRoles("admin"), getStatistics);
router.get("/admin/sales-report", allowRoles("admin"), getSalesReport);

module.exports = router;
