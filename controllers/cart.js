import catchError from "../middlewares/catchError.js";
import cartModel from "../models/cart.js";
import productModel from "../models/Products.js";
import appError from "../utils/appError.js";
import statusText from "../utils/statusText.js";

const addToCart = catchError(async (req, res, next) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;

  if (!productId) {
    return next(
      appError.create("productId is required", 400, statusText.FAIL)
    );
  }

  const product = await productModel.findById(productId);
  if (!product) {
    return next(
      appError.create("Product not found", 404, statusText.FAIL)
    );
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
      items: [{ productId, quantity: qty }]
    });
  } else {
    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
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
    data: { cart }
  });
});


export default {
  addToCart
}
