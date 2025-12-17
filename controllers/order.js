import Order from "../models/order.js";
import Products from "../models/Products.js";
import Stripe from "stripe";


// const stripe = new Stripe(process.env.STRIPE_SECRET);

// create order
export const createOrder = async (req, res) => {
  try {
    const  products  = req.body.items;
    for (let item of products) {
      const product = await Products.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with id ${item.productId} not found`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for product ${product.name}`
        });
      }
    }

    const order = await Order.create({
      ...req.body,
      userId: req.user.id
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order
    });

  } catch (error) {
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

// get user orders  
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate("items.productId");

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

// get order by id
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params; 
    const userId = req.user.id;

    const order = await Order.findById(id)
      .populate("userId","firstName lastName")       
      .populate("items.productId"); 


    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"

      });
    }
    if(userId!==order.userId){
      return res.status(401).json({
        success : false,
        message:"that order is not yours"
      })
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

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (status === "confirmed" && order.status !== "confirmed") {
      for (const item of order.items) {
        await Products.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: -item.quantity } }
        );
      }
    }

    order.status = status;
    await order.save();

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
  return res.status(404).json({ message: "Order not found" });
}

if (
  order.userId.toString() !== req.user.id &&
  req.user.role !== "admin"
) {
  return res.status(403).json({ message: "Not allowed" });
}
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


// connect payment
export const createPaymentIntent = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order || !order.totalPrice) {
      return res.status(400).json({
        success: false,
        message: "Calculate total price first"
      });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: order.totalPrice * 100, // stripe uses cents
      currency: "usd",
      metadata: { orderId: order._id.toString() }
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

