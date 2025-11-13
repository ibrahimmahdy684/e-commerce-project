import express from "express";
import {getAllCategories, getCategoryById, createCategory, updateCategory,deleteCategory}from "../controllers/category.controller.js";
const router = express.Router();
//import middleware for auth and admin check

//public
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);

//admin only
router.post('/','MIDDLEWARE_FOR_AUTH_AND_ADMIN_CHECK', createCategory);
router.put('/:id','MIDDLEWARE_FOR_AUTH_AND_ADMIN_CHECK', updateCategory);
router.delete('/:id','MIDDLEWARE_FOR_AUTH_AND_ADMIN_CHECK', deleteCategory);


export default router;

