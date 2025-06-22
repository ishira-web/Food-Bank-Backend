import Order from '../UserModels/Order.js';
import { isAdmin, isCustomer } from './UserController.js';
// Create a new order
export const createOrder = async (req, res) => {
    try {
        if(!isCustomer(req)){
            return res.status(403).json({ message: 'Please login as a customer' });
        }
        const { orderItems, totalAmount, address, phone, name, paymentMethod, paymentIntentId, email } = req.body;
        //Order ID Creation
        const orderId = uuidv4();
        //If CashonDelivery then paymentMethod is cash and paymentIntentId is null and if card then paymentMethod is card and paymentIntentId is not null
        if(paymentMethod === 'cash'){
            paymentIntentId = null;
        }else{
            paymentIntentId = uuidv4();
        }
        const order = new Order({
            orderItems,
            totalAmount,
            address,
            phone,
        })
        await order.save();
        res.status(201).json(order);
    }catch(error){
        res.status(500).json({ message: error.message });
    }
}