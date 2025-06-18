import express from  'express';
import { createFood, getAllFoods } from '../Controllers/FoodController.js';
import upload from '../Configs/multer.js';

const foodRoute = express.Router();

foodRoute.post('/createNew',upload.single('image'),createFood)
foodRoute.get('/menu',getAllFoods);

export default foodRoute;