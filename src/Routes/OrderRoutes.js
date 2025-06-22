import express from 'express';
import { createOrder, getOrders, getOrdersAdmin, updateOrderStatus } from '../Controllers/OrderController.js';

export const OrderRoutes = express.Router();

OrderRoutes.post('/', createOrder);
OrderRoutes.get('/', getOrders);
OrderRoutes.get('/admin/all', getOrdersAdmin);
OrderRoutes.patch('/admin/:id/status', updateOrderStatus);

export default OrderRoutes;