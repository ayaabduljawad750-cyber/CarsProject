import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        default:1,
        min: 1,
      },
    },
  ],

  totalPrice: {
    type: Number,
    default: 0,
  },

  createdAt: { type: Date, default: Date.now },
  lastUpdateAt: { type: Date, default: Date.now },
});

let cartModel = mongoose.model("Cart", cartSchema);

export default cartModel
