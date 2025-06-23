import express from  'express';
import { createFood,getMenu, getNumberofoods } from '../Controllers/FoodController.js';
import upload from '../Configs/multer.js';

const foodRoute = express.Router();

foodRoute.post('/createNew',upload.single('image'),createFood)
foodRoute.get('/menu',getMenu);
foodRoute.get('/getNumber',getNumberofoods);

export default foodRoute;