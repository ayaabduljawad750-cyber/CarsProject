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
    return next(
      appError.create("Quantity exceeds stock", 400, statusText.FAIL)
    );
  }

  let cart = await cartModel.findOne({ userId });

  if (!cart) {
    cart = await cartModel.create({
      userId,
      items: [{ productId, quantity: qty }],
    });
  } else {
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex > -1) {
      const newQty = cart.items[itemIndex].quantity + qty;

      if (newQty > product.stock) {
        return next(
          appError.create("Quantity exceeds stock", 400, statusText.FAIL)
        );
      }

      cart.items[itemIndex].quantity = newQty;
    } else {
      cart.items.push({ productId, quantity: qty });
    }

    await cart.save();
  }

  res.status(201).json({
    status: statusText.SUCCESS,
    message: "add to cart successfully",
    code: 201,
    data: { cart },
  });
});

const getMyCart = catchError(async (req, res, next) => {
  const userId = req.user.id;
  const cart = await cartModel.findOne({ userId });
  if (!cart) {
    await cartModel.insertOne({
      userId,
      items: [],
      createdAt: Date.now(),
      lastUpdateAt: Date.now(),
    });
  }
  res
    .status(200)
    .json({
      status: statusText.SUCCESS,
      message: "your cart is here",
      code: 200,
      data: { cart },
    });
});

const updateCartById = catchError(async (req, res, next) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;
  const cart = await cartModel.findOne({ userId });
  if (!cart) {
    const error = appError.create(
      "you do not have a cart",
      404,
      statusText.FAIL
    );
    next(error);
    return;
  }
  if (quantity > product.stock) {
    const error = appError.create(
      "Quantity exceeds stock",
      400,
      statusText.ERROR
    );
    next(error);
    return;
  }
  const itemIndex = cart.items.findIndex(
    (i) => i.productId.toString() === productId
  );

  if (itemIndex === -1) {
    const error = appError.create("Product not in cart", 404, statusText.FAIL);
    next(error);
    return;
  }

  cart.items[itemIndex].quantity = quantity;
  cart.lastUpdateAt = Date.now();
  await cart.save();
});



export default {
  addToCart,
  getMyCart,
  updateCartById
};
