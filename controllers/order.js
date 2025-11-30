import Order from "../models/order.js";

// Create a new order
export const createOrder = async (req, res) => {
  try {
    console.log('Received order data:', req.body);
    
    const orderData = {
      ...req.body,
      userId: req.user.id 
    };

    const order = await Order.create(orderData);
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// filter order 
export const filterOrders = async (req, res) => {
  try {
    const filters = {};

    if (req.query.status) {
      filters.status = req.query.status;
    }

    if (req.query.userId) {
      filters.userId = req.query.userId;
    }

    if (req.query.paymentMethod) {
      filters.paymentMethod = req.query.paymentMethod;
    }

    const orders = await Order.find(filters)
      .populate("userId")
      .populate("items.product");

    res.json({
      success: true,
      results: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// get all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId")
      .populate("items.productId");

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

// get order by id
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params; 
    const order = await Order.findById(id)
      .populate("userId")       
      .populate("items.productId"); 

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
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

// update status by id
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ["pending", "confirmed"];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value"
      });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true } 
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated",
      data: order
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// update order items by id
export const updateOrderItem = async (req, res) => {
  try {
    const { id } = req.params; 
    const { itemId } = req.body;
    const { productId, quantity } = req.body; 

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    const item = order.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found in order"
      });
    }

    if (productId) item.productId = productId;
    if (quantity !== undefined) item.quantity = quantity;

    await order.save();
    const updatedOrder = await order.populate("items.productId");

    res.status(200).json({
      success: true,
      message: "Order item updated successfully",
      data: updatedOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// get orders by user id
export const getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId })
      .populate("items.productId")  
      .sort({ createdAt: -1 });   

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

// update items by user id
export const updateItemByUser = async (req, res) => {
  try {
    const { userId, orderId } = req.params; // userId + orderId
    const { itemId, productId, quantity } = req.body;

    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found for this user"
      });
    }

    const item = order.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found in order"
      });
    }

    if (productId) item.productId = productId;
    if (quantity !== undefined) item.quantity = quantity;

    await order.save();
    const updatedOrder = await order.populate("items.productId");

    res.status(200).json({
      success: true,
      message: "Item updated successfully",
      data: updatedOrder
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// delete order by id
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params; // order id
    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Order deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// delete order by user
export const deleteOrderByUser = async (req, res) => {
  try {
    const { userId, orderId } = req.params;

    const order = await Order.findOneAndDelete({ _id: orderId, userId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found for this user"
      });
    }

    res.status(200).json({
      success: true,
      message: "Order deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
