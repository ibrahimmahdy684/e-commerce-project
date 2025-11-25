import express from "express";
import productController from "../Controllers/productController.js";
import { protect } from "../middlewares/authMiddleware.js";
import allowRoles from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Create a product (only vendors)
router.post(
  "/",
  protect,
  allowRoles("vendor"),
  productController.createProduct
);

// Get all products approved or not (admin) 
router.get(
  "/all", 
  protect,
  allowRoles("admin"), 
  productController.getAllProducts
);

// Get only approved products (public)
router.get("/approved", productController.getApprovedProducts)

// Get product by ID  (public)
router.get("/:id", productController.getProductById);


// Update product (vendor + admin)
router.put(
  "/:id",
  protect,
  allowRoles("vendor", "admin"),
  productController.updateProduct
);

// Delete product (admin only)
router.delete(
  "/:id",
  protect,
  allowRoles("admin","vendor"),
  productController.deleteProduct
);

export default router;