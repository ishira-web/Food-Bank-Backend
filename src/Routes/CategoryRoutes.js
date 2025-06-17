import express from "express";
import { createCategory } from "../Controllers/CategoryController";

const categoryRoutes = express.Router();

categoryRoutes.post('/create',createCategory);


export default categoryRoutes;