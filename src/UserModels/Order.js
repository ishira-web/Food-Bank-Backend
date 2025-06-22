import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
   orderId: {
    type: String,
    required: true,
    unique: true
   },
   userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
   },
   orderItems: [
    {
        foodId: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        }
    }
   ],
   totalAmount: {
    type: Number,
    required: true
   },
   status: {
    type: String,
    enum: ['preparing', 'ready', 'on the way', 'delivered', 'cancelled'],
    default: 'preparing'
   },
   address: {
    type: String,
    required: true
   },
   phone: {
    type: String,
    required: true
   },
   paymentMethod: {
    type: String,
    enum: ['cash', 'card'],
    default: 'cash'
   },
   paymentIntentId: {
    type: String,
    required: true,
    unique: true
   },
   email: {
    type: String,
    required: true
   },
   name: {
    type: String,
    required: true
   },

});

const Order = mongoose.model('Order', orderSchema);
export default Order;