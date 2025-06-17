import express from "express";
import { createCategory } from "../Controllers/CategoryController.js";

const categoryRoutes = express.Router();

categoryRoutes.post('/create',createCategory);


export default categoryRoutes;