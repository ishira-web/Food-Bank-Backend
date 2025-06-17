import express from  'express';
import { createFood, getAllFoods } from '../Controllers/FoodController.js';

const foodRoute = express.Router();

foodRoute.post('/createNew',createFood)
foodRoute.get('/menu',getAllFoods);

export default foodRoute;