import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId()
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1
    },
    price: Number,
    totalItemPrice: Number
  }],
  
  totalPrice: {
    type: Number,
    default: 0
  },
  
  paymentMethod: {
    type: String,
    required: true,
    enum: ['cash', 'card']
  },
  
  // Simple card details storage
  cardDetails: {
    cardNumber: {
      type: String,
      select: false
    },
    cardHolder: String,
    expiryDate: String,
    cvv: {
      type: String,
      select: false
    }
  },

  status: {
    type: String,
    enum: ['pending', 'paid', 'cancelled'],
    default: 'pending'
  },

  orderDate: {
    type: Date,
    default: Date.now
  },

  shippingAddress: {
    fullName: String,
    address: String,
    city: String,
    phone: String,
    email: String
  }

}, { 
  timestamps: true 
});

// Calculate total price before saving AND reserve inventory
orderSchema.pre('save', async function (next) {
  try {
    let total = 0;
    const session = this.$session();
    
    for (const item of this.items) {
      const product = await mongoose
        .model('Product')
        .findById(item.productId)
        .select('price name stock')
        .session(session);

      if (!product) {
        throw new Error(`Product with id ${item.productId} not found`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Not enough stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
      }

      item.price = product.price;
      item.totalItemPrice = product.price * item.quantity;
      total += item.totalItemPrice;
    }

    this.totalPrice = total;
    
    next();
  } catch (error) {
    next(error);
  }
});

// Reserve inventory when order is created
orderSchema.post('save', async function (doc, next) {
  try {
    const session = doc.$session();
    
    // Only reserve inventory for new orders with status 'pending'
    if (doc.status === 'pending') {
      for (const item of doc.items) {
        await mongoose.model('Product').findByIdAndUpdate(
          item.productId,
          { $inc: { stock: -item.quantity } },
          { session }
        );
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Static method to safely update order status
orderSchema.statics.updateStatus = async function(orderId, newStatus, userId = null, isAdmin = false) {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    const order = await this.findById(orderId).session(session);
    
    if (!order) {
      throw new Error('Order not found');
    }
    
    // Check permissions
    if (!isAdmin && order.userId.toString() !== userId) {
      throw new Error('Not authorized to update this order');
    }
    
    // Validate status transition
    const validTransitions = {
      'pending': ['paid', 'cancelled'],
      'paid': ['cancelled'],
      'cancelled': [] // No transitions from cancelled
    };
    
    if (!validTransitions[order.status]?.includes(newStatus)) {
      throw new Error(`Invalid status transition from ${order.status} to ${newStatus}`);
    }
    
    // Update status
    const oldStatus = order.status;
    order.status = newStatus;
    
    // Handle inventory changes for status transitions
    if (oldStatus === 'pending' && newStatus === 'cancelled') {
      // Restore stock when cancelling a pending order
      for (const item of order.items) {
        await mongoose.model('Product').findByIdAndUpdate(
          item.productId,
          { $inc: { stock: item.quantity } },
          { session }
        );
      }
    } else if (oldStatus === 'paid' && newStatus === 'cancelled') {
      // Restore stock when cancelling a paid order
      for (const item of order.items) {
        await mongoose.model('Product').findByIdAndUpdate(
          item.productId,
          { $inc: { stock: item.quantity } },
          { session }
        );
      }
    }
    // Note: No inventory change from pending to paid (already reserved on creation)
    
    await order.save({ session });
    await session.commitTransaction();
    
    return order;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Static method to create order with inventory reservation
orderSchema.statics.createWithInventoryReservation = async function(orderData) {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    // Check inventory availability first
    for (const item of orderData.items) {
      const product = await mongoose.model('Product')
        .findById(item.productId)
        .select('stock name')
        .session(session);
      
      if (!product) {
        throw new Error(`Product with id ${item.productId} not found`);
      }
      
      if (product.stock < item.quantity) {
        throw new Error(`Not enough stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
      }
    }
    
    // Create order
    const order = await this.create([orderData], { session });
    
    // Reserve inventory
    for (const item of orderData.items) {
      await mongoose.model('Product').findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } },
        { session }
      );
    }
    
    await session.commitTransaction();
    return order[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const Order = mongoose.model("Order", orderSchema);
export default Order;