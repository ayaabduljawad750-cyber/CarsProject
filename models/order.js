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
  
  paymentMethod: {
    type: String,
    required: true,
    enum: ['cash','stripe'] 
  },
 
  confirmationCode: {
    type: String
  },

  status: {
    type: String,
    enum: ['pending', 'confirmed'],
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
  }

}, { 
  timestamps: true 
});

orderSchema.pre('save', async function (next) {
  for (const item of this.items) {
    const product = await mongoose
      .model('Product')
      .findById(item.productId);

    if (!product) {
      return next(new Error("Product not found"));
    }

    item.price = product.price;
    item.totalItemPrice = product.price * item.quantity;
  }

  this.totalPrice = this.items.reduce(
    (total, item) => total + item.totalItemPrice,
    0
  );

  next();
});

const Order = mongoose.model("Order", orderSchema);

export default Order; 