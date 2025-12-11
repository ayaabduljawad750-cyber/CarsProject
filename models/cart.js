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

/* ✅ CALCULATE TOTAL BEFORE SAVE */
cartSchema.pre("save", async function (next) {
  const Product = mongoose.model("Product");
  let total = 0;

  for (let item of this.items) {
    const product = await Product.findById(item.productId);
    if (product) {
      total += product.price * item.quantity;
    }
  }

  this.totalPrice = total;
  this.lastUpdateAt = Date.now();
  next();
});

/* ✅ CALCULATE TOTAL BEFORE UPDATE */
cartSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  const Product = mongoose.model("Product");

  if (update.items) {
    let total = 0;

    for (let item of update.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        total += product.price * item.quantity;
      }
    }

    update.totalPrice = total;
    update.lastUpdateAt = Date.now();
    this.setUpdate(update);
  }

  next();
});

let cartModel = mongoose.model("Cart", cartSchema);

export default cartModel
