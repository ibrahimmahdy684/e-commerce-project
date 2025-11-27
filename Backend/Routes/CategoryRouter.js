
const {getAllCategories, getCategoryById, createCategory, updateCategory,deleteCategory} = require("../Controllers/CategoryController");
const express = require("express");
const router = express.Router();
//import middleware for auth and admin check
import {authMiddleware, adminMiddleware} from '../Middleware/authMiddleware.js';
import {roleMiddleware} from '../Middleware/roleMiddleware.js';
//public
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);

// //admin only
router.post('/',authMiddleware,roleMiddleware('admin'), createCategory);
router.put('/:id',authMiddleware, roleMiddleware('admin'),updateCategory);
router.delete('/:id',authMiddleware, roleMiddleware('admin'),deleteCategory);


module.exports = router;