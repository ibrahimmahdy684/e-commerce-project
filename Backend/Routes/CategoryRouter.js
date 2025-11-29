const express = require("express");
const router = express.Router();

const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require("../Controllers/CategoryController");

// FIXED: correct import
const protect = require("../Middleware/authMiddleware.js");

// correct import for role middleware
const allowRoles = require("../Middleware/roleMiddleware.js");

// Public routes
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);

// Admin-only routes
router.post("/", protect, allowRoles("admin"), createCategory);
router.put("/:id", protect, allowRoles("admin"), updateCategory);
router.delete("/:id", protect, allowRoles("admin"), deleteCategory);

module.exports = router;
