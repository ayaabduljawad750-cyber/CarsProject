import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import Order from "../models/order.js";
import Products from "../models/Products.js";

// Create order with inventory reservation
export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    const { items, paymentMethod, shippingAddress, cardDetails } = req.body;
    
    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Items array is required"
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Payment method is required"
      });
    }

    // Validate card details if paying by card
    if (paymentMethod === 'card') {
      if (!cardDetails || !cardDetails.cardNumber || !cardDetails.cardHolder || 
          !cardDetails.expiryDate || !cardDetails.cvv) {
        return res.status(400).json({
          success: false,
          message: "Complete card details are required for card payment"
        });
      }
      
      // Simple card number validation
      if (cardDetails.cardNumber.replace(/\s/g, '').length < 13) {
        return res.status(400).json({
          success: false,
          message: "Invalid card number"
        });
      }
    }

    // Create order data
    const orderData = {
      userId: req.user.id,
      items,
      paymentMethod,
      shippingAddress,
      status: 'pending'
    };

    // Include card details if paying by card
    if (paymentMethod === 'card') {
      orderData.cardDetails = {
        cardNumber: cardDetails.cardNumber.slice(-4),
        cardHolder: cardDetails.cardHolder,
        expiryDate: cardDetails.expiryDate,
        cvv: cardDetails.cvv
      };
      
      // Mark as paid for card payments
      orderData.status = 'paid';
    }

    // Check inventory availability first
    for (const item of items) {
      const product = await Products.findById(item.productId).session(session);
      
      if (!product) {
        throw new Error(`Product with id ${item.productId} not found`);
      }
      
      if (product.stock < item.quantity) {
        throw new Error(`Not enough stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
      }
    }

    // Create order
    const order = await Order.create([orderData], { session });

    // Reserve inventory (decrease stock)
    for (const item of items) {
      await Products.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } },
        { session }
      );
    }

    await session.commitTransaction();
    
    const populatedOrder = await Order.findById(order[0]._id)
      .populate('items.productId', 'name price')
      .populate('userId', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: `Order created successfully${paymentMethod === 'card' ? ' and marked as paid' : ''}`,
      data: populatedOrder
    });

  } catch (error) {
    await session.abortTransaction();
    console.error("Create order error:", error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  } finally {
    session.endSession();
  }
};

// User cancels their own order
export const cancelMyOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const order = await Order.updateStatus(id, 'cancelled', userId, false);
    
    res.status(200).json({
      success: true,
      message: "Order cancelled successfully. Inventory has been restored.",
      data: order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Admin updates order status (cancel or mark as paid)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['paid', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'paid' or 'cancelled'"
      });
    }
    
    const order = await Order.updateStatus(id, status, req.user.id, true);
    
    let message = `Order marked as ${status}`;
    if (status === 'cancelled') {
      message += '. Inventory has been restored.';
    }
    
    res.status(200).json({
      success: true,
      message: message,
      data: order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all orders (admin only)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "firstName lastName email")
      .populate("items.productId", "name price stock");
  
    res.status(200).json({
      success: true,
      results: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get user's own orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate("items.productId", "name price");
    
    res.status(200).json({
      success: true,
      results: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    const order = await Order.findById(id)
      .populate("userId", "firstName lastName email")
      .populate("items.productId");
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }
    
    // Check permissions
    if (!isAdmin && order.userId._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this order"
      });
    }
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Filter orders (admin only)
export const filterOrders = async (req, res) => {
  try {
    const { status, userId, paymentMethod, startDate, endDate } = req.query;
    const filters = {};
    
    if (status) filters.status = status;
    if (userId) filters.userId = userId;
    if (paymentMethod) filters.paymentMethod = paymentMethod;
    
    // Date range filter
    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) filters.createdAt.$gte = new Date(startDate);
      if (endDate) filters.createdAt.$lte = new Date(endDate);
    }
    
    const orders = await Order.find(filters)
      .populate("userId", "firstName lastName email")
      .populate("items.productId", "name price");
    
    res.status(200).json({
      success: true,
      results: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete order (admin only)
export const deleteOrder = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    const { id } = req.params;
    
    // Check if order exists
    const order = await Order.findById(id).session(session);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }
    
    // Restore stock if order was not already cancelled
    if (order.status !== 'cancelled') {
      for (const item of order.items) {
        await Products.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: item.quantity } },
          { session }
        );
      }
    }
    
    await Order.findByIdAndDelete(id, { session });
    await session.commitTransaction();
    
    res.status(200).json({
      success: true,
      message: "Order deleted successfully. Inventory has been restored."
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      success: false,
      message: error.message
    });
  } finally {
    session.endSession();
  }
};