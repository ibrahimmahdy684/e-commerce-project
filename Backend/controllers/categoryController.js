import {Category} from "../Models/categoryModel.js";
import {Product} from "../Models/productModel.js";

export const getAllCategories = async (req, res) => {

    try {
        const categories = await Category.find({});
        if(categories.length === 0){
            return res.status(404).json({message: "No categories found"});
        }
        res.status(200).json(categories);
    } catch (e) {
        res.status(500).json({message: "Error fetching categories", error: e.message});
    }};

export const createCategory = async (req, res) => {
    try {
        const {name, description} = req.body;
        if (!name || name.trim() === "") {
  return res.status(400).json({ message: "Category name is required" });
}
        const newCategory = new Category({name, description});
        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (e) {
        res.status(500).json({message: "Error creating category", error: e.message});
    }};

//  PUT update a category by ID (admin only)
export const updateCategory = async (req,res) => {
    try {
        const { id } = req.params;
         const updated = await Category.findByIdAndUpdate(id, req.body, { new: true });
            if (!updated) { 
                return res.status(404).json({ message: "Category not found" });
            }
            res.status(200).json(updated);
    } catch (e) {
        res.status(500).json({ message: "Error updating category", error: e.message });
    }};

//delete caqtegory by ID (admin only)
//but we check that there are no products linked to this category

export const deleteCategory = async (req, res) => {
    try {
        const {id} = req.params;
        const category = await Category.findById(id);
        if(!category){
            return res.status(404).json({message: "Category not found"});
        }
        const linkedProducts = await Product.find({ category_id: id });
        if (linkedProducts.length > 0) {
            return res.status(400).json({ message:"some products still exist in this category please delete them first", linkedProductsCount : linkedProducts.length });
        }
        const deleted = await Category.findByIdAndDelete(id);
if (!deleted) {
  return res.status(404).json({ message: "Category already deleted or not found" });
}
    return res.status(200).json({message: "Category deleted successfully"});
    } catch (e) {
        res.status(500).json({message: "Error deleting category", error: e.message});
    }};

    //get category by id

export const getCategoryById = async (req,res)=> {
    try {
        const {id} = req.params;
        const category = await Category.findById(id);
        if(!category){
            return res.status(404).json({message: "Category not found"});
        }
        res.status(200).json(category);
    } catch (e) {
        res.status(500).json({message: "Error fetching category", error: e.message});
    }};






