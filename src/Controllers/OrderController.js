import Order from '../UserModels/Order.js';
import mongoose from 'mongoose';

export const createOrder = async (req, res) => {
  try {
    
    const userId = req.user.id; // This comes from the verified token
    
    const {
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
    if (!orderItems || !totalAmount || !deliveryAddress || !phone || !customerName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ message: 'Order items must be a non-empty array' });
    }

    // Validate card details if payment is by card
    if (paymentMethod === 'card') {
      if (!cardNumber || !cardType) {
        return res.status(400).json({ message: 'Card details required for card payments' });
      }
      
      // Validate card number format
      if (!/^\d{13,19}$/.test(cardNumber)) {
        return res.status(400).json({ message: 'Invalid card number format' });
      }
    }

    // Create order data object
    const orderData = {
      user: userId, // Use authenticated user ID
      orderItems: orderItems.map(({ foodName, quantity, price }) => ({
        foodName,
        quantity,
        price
      })),
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
      responseData.paymentDetails = savedOrder.paymentDetails;
      
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

// Get orders for authenticated user
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id; 
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const status = req.query.status;
    
    const query = { user: userId };
    if (status && ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      query.orderStatus = status;
    }
    
    const orders = await Order.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .select('-paymentDetails -__v -user');
    
    const totalOrders = await Order.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: orders.length,
      total: totalOrders,
      page,
      pages: Math.ceil(totalOrders / limit),
      orders
    });
    
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// Get single order by ID (for authenticated user)
export const getOrderById = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }
    
    const order = await Order.findOne({
      _id: orderId,
      user: userId
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Mask sensitive payment details
    const orderData = order.toObject();
    if (orderData.paymentDetails) {
      orderData.paymentDetails.cardType = orderData.paymentDetails.cardType;
      orderData.paymentDetails.maskedCardNumber = orderData.paymentDetails.maskedCardNumber;
      delete orderData.paymentDetails.cardNumber;
    }
    
    res.status(200).json({
      success: true,
      order: orderData
    });
    
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
};

// Update order status (Admin only)
export const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status, cancellationReason } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }
    
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status'
      });
    }
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Prevent updating completed orders
    if (order.orderStatus === 'delivered' || order.orderStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update completed orders'
      });
    }
    
    // Status transition validation
    const statusFlow = {
      pending: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered']
    };
    
    if (statusFlow[order.orderStatus] && !statusFlow[order.orderStatus].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${order.orderStatus} to ${status}`
      });
    }
    
    // Update order status
    order.orderStatus = status;
    
    // Handle cancellation
    if (status === 'cancelled') {
      order.paymentStatus = 'refunded';
      order.cancellationReason = cancellationReason || 'Customer request';
      
      // Add cancellation timestamp
      order.cancelledAt = new Date();
    }
    
    // Set delivery timestamp if status is delivered
    if (status === 'delivered') {
      order.deliveredAt = new Date();
      order.paymentStatus = 'completed';
    }
    
    const updatedOrder = await order.save();
    
    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order: {
        _id: updatedOrder._id,
        orderId: updatedOrder.orderId,
        orderStatus: updatedOrder.orderStatus,
        paymentStatus: updatedOrder.paymentStatus,
        updatedAt: updatedOrder.updatedAt
      }
    });
    
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

// Get total revenue (Admin only)
export const getTotalRevenue = async (req, res) => {
  try {
    // Date range parameters (optional)
    const startDate = req.query.startDate 
      ? new Date(req.query.startDate) 
      : new Date(0); // Beginning of time
      
    const endDate = req.query.endDate 
      ? new Date(req.query.endDate)
      : new Date(); // Current date/time

    // Payment status filter (default: completed payments)
    const paymentStatus = req.query.paymentStatus || 'completed';

    const result = await Order.aggregate([
      {
        $match: {
          paymentStatus,
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 }
        }
      }
    ]);

    const revenueData = result.length > 0 
      ? result[0]
      : { totalRevenue: 0, orderCount: 0 };

    res.status(200).json({
      success: true,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      paymentStatus,
      ...revenueData
    });

  } catch (error) {
    console.error('Error calculating revenue:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate revenue',
      error: error.message
    });
  }
};

// Get daily revenue breakdown (Admin only)
export const getRevenueTrends = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const results = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          dailyRevenue: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 }
        }
      },
      {
        $sort: { "_id": 1 }
      },
      {
        $project: {
          date: "$_id",
          dailyRevenue: 1,
          orderCount: 1,
          _id: 0
        }
      }
    ]);

    // Fill in missing days with zero values
    const dateMap = new Map();
    const currentDate = new Date(startDate);
    const today = new Date();

    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split('T')[0];
      dateMap.set(dateStr, {
        date: dateStr,
        dailyRevenue: 0,
        orderCount: 0
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    results.forEach(day => {
      dateMap.set(day.date, day);
    });

    const revenueTrends = Array.from(dateMap.values());

    res.status(200).json({
      success: true,
      days,
      revenueTrends
    });

  } catch (error) {
    console.error('Error fetching revenue trends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue trends',
      error: error.message
    });
  }
};

// Get all orders (Admin only)
export const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const orders = await Order.find()
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .select('-paymentDetails -__v');

    const totalOrders = await Order.countDocuments();

    res.status(200).json({
      success: true,
      count: orders.length,
      total: totalOrders,
      page,
      pages: Math.ceil(totalOrders / limit),
      orders
    });

  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};