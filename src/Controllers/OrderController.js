import Order from "../UserModels/Order.js";
import Food from "../UserModels/Food.js";

export const createOrder = async (req, res) => {
    try {
        const { customerName, customerAddress, customerEmail, foodItems, paymentType } = req.body;
        const userId = req.user._id; // From authentication middleware

        // Calculate total price and get food details
        let totalPrice = 0;
        const populatedFoodItems = await Promise.all(foodItems.map(async item => {
            const food = await Food.findById(item.foodId);
            if (!food) {
                throw new Error(`Food item with ID ${item.foodId} not found`);
            }
            
            totalPrice += food.price * item.quantity;
            
            return {
                foodId: food._id,
                name: food.name,
                price: food.price,
                quantity: item.quantity
            };
        }));

        const newOrder = new Order({
            user: userId,
            customerName,
            customerAddress,
            customerEmail,
            foodItems: populatedFoodItems,
            totalPrice,
            paymentType
        });

        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getUserOrders = async (req, res) => {
    try {
        const userId = req.user._id;
        const orders = await Order.find({ user: userId })
            .sort({ createdAt: -1 }) // Newest first
            .populate('foodItems.foodId', 'name image'); // Populate food details
        
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all orders (for admin)
export const getAllOrders = async (req, res) => {
    try {
        // Check if user is admin (you need to implement this check)
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .populate('user', 'name email') // Populate user details
            .populate('foodItems.foodId', 'name');
        
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Update order status
export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        // Check if user is admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { orderStatus: status },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};