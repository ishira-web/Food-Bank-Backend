import Category from "../UserModels/Category.js";
import Food from "../UserModels/Food.js";

export const createCategory = async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                message: "Request body is missing"
            });
        }
        const { categoryName } = req.body;
        if (!categoryName || typeof categoryName !== 'string' || categoryName.trim() === '') {
            return res.status(400).json({
                success: false,
                message: "Valid category name is required"
            });
        }
        const trimmedCategoryName = categoryName.trim();
        const existingCategory = await Category.findOne({ 
            categoryName: trimmedCategoryName 
        }); 
        if (existingCategory) {
            return res.status(409).json({
                success: false,
                message: "Category already exists"
            });
        }
        const newCategory = new Category({ 
            categoryName: trimmedCategoryName 
        });
        await newCategory.save();
        return res.status(201).json({
            success: true,message: "Category created successfully",data: {
                id: newCategory._id,
                name: newCategory.categoryName
            }
        });

    } catch (error) {
        console.error("Error creating category:", error);
        return res.status(500).json({success: false,message: "Internal server error",});
    }
};


// Get All Categories

export const getCategories = async(req,res)=>{
    try {
        const categories = await Category.find().sort({createdAt:-1});
         res.status(200).json({success: true,message: "Categories fetched successfully",data: categories,});
    } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({success: false,message: "Failed to fetch categories",error: error.message,});
    }
}

export const getAllbyCategoryName = async (req, res) => {
  try {
    const { categoryName } = req.params;
    if (!categoryName) {
     return res.status(400).json({ message: "Category name is required" });}
    const category = await Category.findOne({ categoryName });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    const foods = await Food.find({ categoryName: category._id });
    res.status(200).json({success: true,message: `Foods in category: ${categoryName}`,data: foods,});
  } catch (error) {
    console.error("Error fetching foods by category name:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
