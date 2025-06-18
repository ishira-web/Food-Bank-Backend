import Food from "../UserModels/Food.js";
import cloudinary from "../Configs/Cloudinary.js";

// Create Food
export const createFood = async (req, res) => {
  try {
    const { foodName,  price, description, categoryName } = req.body;
    if (!foodName || !req.file || !price || !description || !categoryName) {
      return res.status(400).json({ message: "All fields are required!" });
    }
    
    const imageStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    const result = await cloudinary.uploader.upload(imageStr, {folder: "Foods",});
    const newFood = new Food({foodName,image : result.secure_url,price,description,categoryName,});
    await newFood.save();
    return res.status(201).json({success: true,message: "Food item created successfully!",data: newFood,});
  } catch (error) {
    console.error("Error creating food:", error);
    return res.status(500).json({success: false,message: "Server error while creating food item",error: error.message,});
  }
};

// Get All Foods
export const getAllFoods = async (req, res) => {
  try {
    const allFoods = await Food.find().populate("categoryName");

    if (!allFoods || allFoods.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No food items found",
      });
    }

    res.status(200).json({
      success: true,
      message: "All food items fetched successfully",
      data: allFoods,
    });
  } catch (error) {
    console.error("Error fetching food items:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching food items",
      error: error.message,
    });
  }
};
