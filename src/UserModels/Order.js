// models/order.js
import mongoose from 'mongoose';
import Counter from './Counter.js';

const orderItemSchema = new mongoose.Schema({
  foodName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
});

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true
  },
  paymentIntentId: {
    type: String,
    unique: true,
    sparse: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  orderItems: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  deliveryAddress: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'cash'],
    default: 'card'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Pre-save hook to generate custom order ID
orderSchema.pre('save', async function(next) {
  if (!this.isNew) return next();
  
  try {
    // Generate order ID for all orders
    const orderCounter = await Counter.findOneAndUpdate(
      { name: 'orderId' },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );
    this.orderId = `#ODR${orderCounter.value.toString().padStart(4, '0')}`;
    
    // Generate payment ID ONLY for card payments
    if (this.paymentMethod === 'card' && !this.paymentIntentId) {
      const paymentCounter = await Counter.findOneAndUpdate(
        { name: 'paymentId' },
        { $inc: { value: 1 } },
        { new: true, upsert: true }
      );
      const randomDigits = Math.floor(1000000 + Math.random() * 9000000);
      this.paymentIntentId = `#PAY${paymentCounter.value.toString().padStart(2, '0')}${randomDigits}`;
    }
    
    next();
  } catch (error) {
    next(error);
  }
});
const Order = mongoose.model('Order', orderSchema);

export default Order;