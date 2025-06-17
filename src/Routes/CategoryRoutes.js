import express from "express";
import { createCategory, getCategories } from "../Controllers/CategoryController.js";

const categoryRoutes = express.Router();

categoryRoutes.post('/create',createCategory);
categoryRoutes.get('/allCategory',getCategories);

export default categoryRoutes;