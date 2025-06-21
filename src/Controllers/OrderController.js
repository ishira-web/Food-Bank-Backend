import Order from '../UserModels/Order.js';
import Food from '../UserModels/Food.js';
import PaymentService from '../Services/paymentService.js';
import { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } from '../Services/emailService.js';

class OrderController {
    static async createOrder(req, res) {
        try {
            const { customerName, customerAddress, customerEmail, foodItems, paymentType, deliveryInstructions } = req.body;
            const userId = req.user._id;

            // Validate input
            const validationErrors = this.validateOrderInput(
                customerName, customerAddress, customerEmail, foodItems, paymentType
            );
            
            if (validationErrors.length > 0) {
                return res.status(400).json({ errors: validationErrors });
            }

            // Process food items and calculate total
            const { populatedFoodItems, totalPrice } = await this.processFoodItems(foodItems);

            // Create order data
            const orderData = {
                user: userId,
                customerName,
                customerAddress,
                customerEmail,
                foodItems: populatedFoodItems,
                totalPrice,
                paymentType,
                deliveryInstructions
            };

            // Handle payment based on type
            if (paymentType === 'card') {
                return this.handleCardPayment(orderData, res);
            } else {
                return this.handleCashOnDelivery(orderData, res);
            }
        } catch (error) {
            console.error('Order creation error:', error);
            res.status(400).json({ 
                message: error.message || 'Failed to create order',
                error: error.message
            });
        }
    }

    // Get all orders for a user
    static async getUserOrders(req, res) {
        try {
            const userId = req.user._id;
            const { status, limit = 10, page = 1 } = req.query;
            
            const query = { user: userId };
            if (status) {
                query.orderStatus = status;
            }

            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                sort: { createdAt: -1 },
                populate: [
                    { path: 'foodItems.foodId', select: 'name image price' },
                    { path: 'user', select: 'name email' }
                ]
            };

            const orders = await Order.paginate(query, options);
            
            res.status(200).json({
                data: orders.docs,
                total: orders.totalDocs,
                limit: orders.limit,
                page: orders.page,
                pages: orders.totalPages
            });
        } catch (error) {
            res.status(500).json({ 
                message: 'Failed to fetch orders',
                error: error.message 
            });
        }
    }

    // Get order by ID
    static async getOrderById(req, res) {
        try {
            const orderId = req.params.id;
            const userId = req.user._id;
            
            const order = await Order.findOne({
                _id: orderId,
                user: userId
            }).populate('foodItems.foodId', 'name image price');
            
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }
            
            res.status(200).json(order);
        } catch (error) {
            res.status(500).json({ 
                message: 'Failed to fetch order',
                error: error.message 
            });
        }
    }

    // Update order status (Admin only)
    static async updateOrderStatus(req, res) {
        try {
            if (!req.user.isAdmin) {
                return res.status(403).json({ message: 'Unauthorized' });
            }

            const orderId = req.params.id;
            const { status, estimatedDeliveryTime } = req.body;
            
            const validStatuses = ['pending', 'processing', 'out_for_delivery', 'delivered', 'cancelled'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ message: 'Invalid status' });
            }

            const updateData = { orderStatus: status };
            if (estimatedDeliveryTime) {
                updateData.estimatedDeliveryTime = new Date(estimatedDeliveryTime);
            }

            const updatedOrder = await Order.findByIdAndUpdate(
                orderId,
                updateData,
                { new: true }
            ).populate('user', 'name email');

            if (!updatedOrder) {
                return res.status(404).json({ message: 'Order not found' });
            }

            // Send status update email
            await sendOrderStatusUpdateEmail(
                updatedOrder.user.email,
                updatedOrder._id,
                status,
                updatedOrder.estimatedDeliveryTime
            );

            res.status(200).json(updatedOrder);
        } catch (error) {
            res.status(500).json({ 
                message: 'Failed to update order status',
                error: error.message 
            });
        }
    }

    // Cancel order (User)
    static async cancelOrder(req, res) {
        try {
            const orderId = req.params.id;
            const userId = req.user._id;
            
            const order = await Order.findOne({
                _id: orderId,
                user: userId
            });

            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }

            // Check if order can be cancelled
            if (!['pending', 'processing'].includes(order.orderStatus)) {
                return res.status(400).json({ 
                    message: 'Order cannot be cancelled at this stage' 
                });
            }

            // Handle refund if payment was made
            if (order.paymentType === 'card' && order.paymentStatus === 'completed') {
                await PaymentService.refundPayment(order.paymentIntentId);
            }

            const updatedOrder = await Order.findByIdAndUpdate(
                orderId,
                { 
                    orderStatus: 'cancelled',
                    paymentStatus: order.paymentType === 'card' ? 'refunded' : 'failed'
                },
                { new: true }
            );

            res.status(200).json(updatedOrder);
        } catch (error) {
            res.status(500).json({ 
                message: 'Failed to cancel order',
                error: error.message 
            });
        }
    }

    // Get all orders (Admin)
    static async getAllOrders(req, res) {
        try {
            if (!req.user.isAdmin) {
                return res.status(403).json({ message: 'Unauthorized' });
            }

            const { status, paymentType, limit = 20, page = 1 } = req.query;
            
            const query = {};
            if (status) {
                query.orderStatus = status;
            }
            if (paymentType) {
                query.paymentType = paymentType;
            }

            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                sort: { createdAt: -1 },
                populate: [
                    { path: 'foodItems.foodId', select: 'name price' },
                    { path: 'user', select: 'name email' }
                ]
            };

            const orders = await Order.paginate(query, options);
            
            res.status(200).json({
                data: orders.docs,
                total: orders.totalDocs,
                limit: orders.limit,
                page: orders.page,
                pages: orders.totalPages
            });
        } catch (error) {
            res.status(500).json({ 
                message: 'Failed to fetch orders',
                error: error.message 
            });
        }
    }

    // Helper method to validate order input
    static validateOrderInput(customerName, customerAddress, customerEmail, foodItems, paymentType) {
        const errors = [];
        
        if (!customerName || customerName.trim().length < 2) {
            errors.push('Customer name is required and must be at least 2 characters');
        }
        
        if (!customerAddress || customerAddress.trim().length < 10) {
            errors.push('A valid address is required (minimum 10 characters)');
        }
        
        const emailRegex = /\S+@\S+\.\S+/;
        if (!customerEmail || !emailRegex.test(customerEmail)) {
            errors.push('A valid email address is required');
        }
        
        if (!Array.isArray(foodItems) || foodItems.length === 0) {
            errors.push('At least one food item is required');
        }
        
        if (!['cash_on_delivery', 'card'].includes(paymentType)) {
            errors.push('Invalid payment type');
        }
        
        return errors;
    }

    // Helper method to process food items and calculate total
    static async processFoodItems(foodItems) {
        let totalPrice = 0;
        const populatedFoodItems = [];
        
        for (const item of foodItems) {
            const food = await Food.findById(item.foodId);
            if (!food) {
                throw new Error(`Food item with ID ${item.foodId} not found`);
            }
            
            if (item.quantity <= 0) {
                throw new Error(`Invalid quantity for item ${food.name}`);
            }
            
            const itemTotal = food.price * item.quantity;
            totalPrice += itemTotal;
            
            populatedFoodItems.push({
                foodId: food._id,
                name: food.name,
                price: food.price,
                quantity: item.quantity
            });
        }
        
        // Round to 2 decimal places
        totalPrice = parseFloat(totalPrice.toFixed(2));
        
        return { populatedFoodItems, totalPrice };
    }

    // Helper method to handle card payments
    static async handleCardPayment(orderData, res) {
        const metadata = {
            userId: orderData.user.toString(),
            customerEmail: orderData.customerEmail,
            orderDescription: `Order for ${orderData.customerName}`
        };

        const paymentIntent = await PaymentService.createPaymentIntent(
            orderData.totalPrice,
            'usd',
            metadata
        );

        // Add payment intent ID to order data
        orderData.paymentIntentId = paymentIntent.id;

        // Return payment intent to client
        res.status(200).json({
            requiresPayment: true,
            clientSecret: paymentIntent.client_secret,
            orderData
        });
    }

    // Helper method to handle cash on delivery
    static async handleCashOnDelivery(orderData, res) {
        const newOrder = new Order({
            ...orderData,
            paymentStatus: 'pending',
            orderStatus: 'pending'
        });

        const savedOrder = await newOrder.save();
        
        // Send order confirmation email
        await sendOrderConfirmationEmail(
            savedOrder.customerEmail,
            savedOrder._id,
            savedOrder.customerName,
            savedOrder.totalPrice
        );

        res.status(201).json(savedOrder);
    }
}

export default OrderController;