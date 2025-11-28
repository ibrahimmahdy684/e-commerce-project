const express = require("express");
const router = express.Router();

const productController = require("../Controllers/productController.js");
const protect = require("../Middleware/authMiddleware.js");
const allowRoles = require("../Middleware/roleMiddleware.js");

// Create a product (vendor only)
router.post(
  "/",
  protect,
  allowRoles("vendor"),
  productController.createProduct
);

// Get all products (admin only)
router.get(
  "/all",
  protect,
  allowRoles("admin"),
  productController.getAllProducts
);

// Get only approved products (public)
router.get("/approved", productController.getApprovedProducts);

// Get product by ID (public)
router.get("/:id", productController.getProductById);

// Update product (vendor + admin)
router.put(
  "/:id",
  protect,
  allowRoles("vendor", "admin"),
  productController.updateProduct
);

// Delete product (admin OR vendor)
router.delete(
  "/:id",
  protect,
  allowRoles("admin", "vendor"),
  productController.deleteProduct
);

module.exports = router;
