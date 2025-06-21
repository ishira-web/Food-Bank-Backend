import express from 'express';
import OrderController from '../Controllers/OrderController.js';
import PaymentController from '../Controllers/paymentController.js';

const router = express.Router();

// Order routes
router.post('/', OrderController.createOrder);
router.get('/', OrderController.getUserOrders);
router.get('/:id', OrderController.getOrderById);
router.patch('/:id/cancel', OrderController.cancelOrder);

// Admin order routes
router.get('/admin/all', OrderController.getAllOrders);
router.patch('/admin/:id/status', OrderController.updateOrderStatus);

// Payment routes
router.post('/payment/intent', PaymentController.createPaymentIntent);
router.post('/payment/webhook', express.raw({type: 'application/json'}), PaymentController.handlePaymentSuccess);
router.post('/payment/refund', PaymentController.refundPayment);

export default router;