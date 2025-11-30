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
    name: String,
    price: Number,
    quantity: {
      type: Number,
      default: 1,
      min: 1
    },
    totalItemPrice: Number
  }],

 totalPrice: {
  type: Number,
  required: false,  
  min: 0
},
  
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

  crossRAL: {
    type: String
  },

  orderDate: {
    type: Date,
    default: Date.now
  },

  shippingAddress: {
    fullName: String,
    address: String,
    city: String,
    notes: String
  }

}, { 
  timestamps: true 
});

orderSchema.pre('save', function(next) {

  this.items.forEach(item => {
    item.totalItemPrice = item.price * item.quantity;
  });

  this.totalPrice = this.items.reduce((total, item) => {
    return total + item.totalItemPrice;
  }, 0);

  next();
});


const Order = mongoose.model("Order", orderSchema);

export default Order; 