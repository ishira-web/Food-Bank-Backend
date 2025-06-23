import Order from '../UserModels/Order.js'
import mongoose from 'mongoose';

export const createOrder = async (req, res) => {
  try {
    const {
      user,
      orderItems,
      totalAmount,
      deliveryAddress,
      phone,
      customerName,
      paymentMethod = 'card',
      cardNumber,
      cardType
    } = req.body;

    // Basic validation
    if (!user || !orderItems || !totalAmount || !deliveryAddress || !phone || !customerName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!mongoose.Types.ObjectId.isValid(user)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ message: 'Order items must be a non-empty array' });
    }

    // Validate card details if payment is by card
    if (paymentMethod === 'card') {
      if (!cardNumber || !cardType) {
        return res.status(400).json({ message: 'Card number and card type are required for card payments' });
      }
      
      // Validate card number format
      if (!/^\d{13,19}$/.test(cardNumber)) {
        return res.status(400).json({ message: 'Invalid card number format' });
      }
    }

    // Create order data object
    const orderData = {
      user,
      orderItems,
      totalAmount,
      deliveryAddress,
      phone,
      customerName,
      paymentMethod,
      paymentStatus: paymentMethod === 'cash' ? 'completed' : 'pending',
      orderStatus: 'pending'
    };

    // Add payment details if payment is by card
    if (paymentMethod === 'card') {
      // Mask card number (show first 2 and last 4 digits)
      const maskedCard = `${cardNumber.substring(0, 2)}••••••••${cardNumber.slice(-4)}`;
      
      orderData.paymentDetails = {
        cardType,
        maskedCardNumber: maskedCard
      };
    }

    // Create new order
    const newOrder = new Order(orderData);
    const savedOrder = await newOrder.save();

    // Prepare response data
    const responseData = {
      orderId: savedOrder.orderId,
      customerName: savedOrder.customerName,
      orderItems: savedOrder.orderItems,
      totalAmount: savedOrder.totalAmount,
      deliveryAddress: savedOrder.deliveryAddress,
      orderStatus: savedOrder.orderStatus,
      paymentMethod: savedOrder.paymentMethod,
      paymentStatus: savedOrder.paymentStatus,
      createdAt: savedOrder.createdAt
    };

    // Add payment details to response if applicable
    if (savedOrder.paymentMethod === 'card') {
      responseData.paymentDetails = {
        cardType: savedOrder.paymentDetails?.cardType,
        maskedCardNumber: savedOrder.paymentDetails?.maskedCardNumber
      };
      
      // Include the paymentIntentId in the response
      if (savedOrder.paymentIntentId) {
        responseData.paymentIntentId = savedOrder.paymentIntentId;
      }
    }

    res.status(201).json({
      message: 'Order created successfully',
      order: responseData
    });

  } catch (error) {
    console.error('Error creating order:', error);
    
    // Handle duplicate key error specifically
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Order creation failed due to duplicate key',
        error: 'Please ensure all unique fields have unique values'
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to create order',
      error: error.message 
    });
  }
};
