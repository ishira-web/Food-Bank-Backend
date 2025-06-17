import Category from "../UserModels/Category.js";
import { isAdmin } from "./UserController.js";
//careate category
export const createCategory = async(req,res)=>{
    try {
        if(!isAdmin){
        return res.status(403).json({message:"please login as an admin to create a category"})
        }
        const {categoryName} = req.body
        const checkCategory =  await Category.findOne({categoryName});
        if(checkCategory){
            return res.status(403).json({success: false,message: "Category already exists"})
        }
        const newCategory =  await new Category({categoryName});
        newCategory.save();
        return res.status(201).json({success: true,message: "Category created successfuly"})
    } catch (error) {
        console.error("Error creating category:", error);
        return res.status(500).json({ success: false,message: "Internal server error",})
    }
}