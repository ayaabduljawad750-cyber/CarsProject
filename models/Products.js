import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100,
  },

  brand: {
    type: String,
    trim: true,
  },

  carModel: {
    type: String,
    trim: true,
  },

  price: {
    type: Number,
    required: true,
    min: 1,
  },

  stock: {
    type: Number,
    required: true,
    min: 0,
  },

  description: {
    type: String,
    maxlength: 500,
  },

  category: {
    type: String,
    enum: ["Spare parts", "Tyres", "Engine oil", "Batteries", "Liquids"],
    required: true,
  },

  evaluation: {
    type: Number,
    min: 1,
    max: 5,
    default: 1,
  },

  image: {
    data: Buffer,
    contentType: String,
  },

  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  lastUpdateAt: {
    type: Date,
    default: Date.now,
  },
});

let productModel = mongoose.model("Product", productSchema);

export default productModel;
