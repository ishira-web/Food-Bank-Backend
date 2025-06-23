import express from 'express';
import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getTotalRevenue,
  getRevenueTrends,
  getAllOrders
} from '../Controllers/OrderController.js';

const OrderRoutes = express.Router();

// User routes
OrderRoutes.post('/create', createOrder); // Create a new order
OrderRoutes.get('/my-orders', getUserOrders); // Get logged-in user's orders
OrderRoutes.get('/my-orders/:id', getOrderById); // Get specific order by ID

// Admin routes
OrderRoutes.put('/update-status/:id', updateOrderStatus); // Update order status (admin)
OrderRoutes.get('/revenue/total', getTotalRevenue); // Get total revenue (admin)
OrderRoutes.get('/revenue/trends', getRevenueTrends); // Get daily revenue trends (admin)
OrderRoutes.get('/all', getAllOrders); // Get all orders (admin)

export default OrderRoutes;
