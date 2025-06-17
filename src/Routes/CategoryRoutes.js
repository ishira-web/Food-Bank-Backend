import express from "express";
import { createCategory, getAllbyCategoryName, getCategories } from "../Controllers/CategoryController.js";

const categoryRoutes = express.Router();

categoryRoutes.post('/create',createCategory);
categoryRoutes.get('/allCategory',getCategories);
categoryRoutes.get('/:categoryName',getAllbyCategoryName);

export default categoryRoutes;