import express from 'express';
import { createOrder } from '../Controllers/OrderController.js';

const OrderRoutes = express.Router();

OrderRoutes.post('/create', createOrder);

export default OrderRoutes;