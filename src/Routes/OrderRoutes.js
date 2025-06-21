import express from 'express';
import OrderController from '../Controllers/OrderController.js';
import PaymentController from '../Controllers/paymentController.js';

const Orouter = express.Router();

// Order routes
Orouter.post('/', OrderController.createOrder);
Orouter.get('/', OrderController.getUserOrders);
Orouter.get('/:id', OrderController.getOrderById);
Orouter.patch('/:id/cancel', OrderController.cancelOrder);

// Admin order routes
Orouter.get('/admin/all', OrderController.getAllOrders);
Orouter.patch('/admin/:id/status', OrderController.updateOrderStatus);

// Payment routes
Orouter.post('/payment/intent', PaymentController.createPaymentIntent);
Orouter.post('/payment/webhook', express.raw({type: 'application/json'}), PaymentController.handlePaymentSuccess);
Orouter.post('/payment/refund', PaymentController.refundPayment);

export default Orouter;