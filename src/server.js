import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './DB/MongoDB.js';
import { userRoutes } from './Routes/UserRoutes.js';
import categoryRoutes from './Routes/CategoryRoutes.js';
import foodRoute from './Routes/FoodRoutes.js';
import { optionalToken } from './Middleware/optionalToken.js'; 
import { router } from './Routes/ReservationRoutes.js';
import Orouter from './Routes/OrderRoutes.js';

dotenv.config();

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
app.use('/api/reservation',router)
app.use('/api/order',Orouter);
// Start Server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  connectDB();
  console.log(`🚀 Server running at http://localhost:${port}`);
});

