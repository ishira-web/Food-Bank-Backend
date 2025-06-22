import Order from '../UserModels/Order.js';
import { isCustomer } from './UserController.js';
import Counter from '../UserModels/Counter.js';

// Create a new order
export const createOrder = async (req, res) => {
    try {
        if (!isCustomer(req)) {
            return res.status(403).json({ message: 'Please login as a customer' });
        }

        const { orderItems, totalAmount, address, phone, name, paymentMethod, email } = req.body;
        
        // Validate required fields
        if (!orderItems || !totalAmount || !address || !phone || !name || !paymentMethod) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Generate custom order ID
        const counter = await Counter.findOneAndUpdate(
            { name: 'orderId' },
            { $inc: { value: 1 } },
            { new: true, upsert: true }
        );

        const orderId = `#ODR${String(counter.value).padStart(4, '0')}`; // Formats as #ODR0001, #ODR0002, etc.
        
        // Handle payment details
        let paymentIntentId = null;
        if (paymentMethod !== 'cash') {
            paymentIntentId = `#PYM${uuidv4().substring(0, 8).toUpperCase()}`; // Example: #PYM3F4G5H6
        }

        const order = new Order({
            orderId,
            orderItems,
            totalAmount,
            address,
            phone,
            name,
            email,
            paymentMethod,
            paymentIntentId: paymentIntentId || undefined,
            userId: req.user.id,
            status: 'preparing'
        });

        await order.save();
        res.status(201).json(order);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Server error while creating order' });
    }
};

// Get all orders related to the user
export const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching orders' });
    }
};

// Get all orders related to the admin
export const getOrdersAdmin = async (req, res) => {
    try {
        const orders = await Order.find();
        res.status(200).json(orders);
    }catch(error){
        res.status(500).json({ message: error.message });
    }
}


// Update order status
export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
    }catch(error){
        res.status(500).json({ message: error.message });
    }
}
