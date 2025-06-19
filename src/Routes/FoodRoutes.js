import express from  'express';
import { createFood,getMenu } from '../Controllers/FoodController.js';
import upload from '../Configs/multer.js';

const foodRoute = express.Router();

foodRoute.post('/createNew',upload.single('image'),createFood)
foodRoute.get('/menu',getMenu);

export default foodRoute;