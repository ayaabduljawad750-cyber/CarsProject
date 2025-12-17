import catchError from "../middlewares/catchError.js";
import cartModel from "../models/cart.js";
import productModel from "../models/Products.js";
import appError from "../utils/appError.js";
import statusText from "../utils/statusText.js";

const addToCart = catchError(async (req, res, next) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;

  if (!productId) {
    return next(appError.create("productId is required", 400, statusText.FAIL));
  }

  const product = await productModel.findById(productId);
  if (!product) {
    return next(appError.create("Product not found", 404, statusText.FAIL));
  }

  const qty = Number(quantity) || 1;
  if (qty > product.stock) {
    return next(appError.create("Quantity exceeds stock", 400, statusText.FAIL));
  }

  let cart = await cartModel.findOne({ userId });

  if (!cart) {
    cart = await cartModel.create({
      userId,
      items: [{ productId, quantity: qty }],
      createdAt: Date.now(),
      lastUpdateAt: Date.now(),
    });
  } else {
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex > -1) {
      // ✅ overwrite instead of increment
      const error = appError.create("Product already in your cart",400,statusText.FAIL)
      next(error)
      return;
    } else {
      cart.items.push({ productId, quantity: qty });
    }

    cart.lastUpdateAt = Date.now();
    await cart.save();
  }

  res.status(201).json({
    status: statusText.SUCCESS,
    message: "Added to cart successfully",
    code: 201,
    data: { cart },
  });
});

const getMyCart = catchError(async (req, res, next) => {
  const userId = req.user.id;
  const cart = await cartModel.findOne({ userId }).populate("items.productId");

  res.status(200).json({
    status: statusText.SUCCESS,
    message: "Your cart is here",
    code: 200,
    data: { cart },
  });
});

const updateCartById = catchError(async (req, res, next) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;

  const cart = await cartModel.findOne({ userId });
  if (!cart) {
    return next(appError.create("You do not have a cart", 404, statusText.FAIL));
  }

  const itemIndex = cart.items.findIndex(
    (i) => i.productId.toString() === productId
  );

  if (itemIndex === -1) {
    return next(appError.create("Product not in cart", 404, statusText.FAIL));
  }

  if (quantity === 0) {
    cart.items.splice(itemIndex, 1);
  } else {
    cart.items[itemIndex].quantity = quantity;
  }

  cart.lastUpdateAt = Date.now();
  await cart.save();

  res.status(200).json({
    status: statusText.SUCCESS,
    message: "Cart updated successfully",
    code: 200,
    data: { cart },
  });
});

const clearCart = catchError(async (req, res, next) => {
  const userId = req.user.id;
  const cart = await cartModel.findOne({ userId });

  if (!cart) {
    return next(appError.create("You do not have a cart", 404, statusText.FAIL));
  }

  cart.items = [];
  cart.lastUpdateAt = Date.now();
  await cart.save();

  res.status(200).json({
    status: statusText.SUCCESS,
    message: "Your cart is empty now",
    code: 200,
    data: null,
  });
});

export default {
  addToCart,
  getMyCart,
  updateCartById,
  clearCart,
};