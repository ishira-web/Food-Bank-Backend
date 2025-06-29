import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './DB/MongoDB.js';
import { userRoutes } from './Routes/UserRoutes.js';
import categoryRoutes from './Routes/CategoryRoutes.js';
import foodRoute from './Routes/FoodRoutes.js';
import { optionalToken } from './Middleware/optionalToken.js'; 
import { router } from './Routes/ReservationRoutes.js';
import OrderRoutes from './Routes/OrderRoutes.js';
import galleryRouter from './Routes/GalleryRoutes.js';
import job from './Corn/corn.js';

dotenv.config();
job.start();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(optionalToken); 

// Routes
app.use('/api/account', userRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/food', foodRoute);
app.use('/api/reservation',router);
app.use('/api/order',OrderRoutes);
app.use('/api/gallery',galleryRouter);


const port = process.env.PORT || 5000;
app.listen(port, () => {
  connectDB();
  console.log(`🚀 Server running at http://localhost:${port}`);
});

