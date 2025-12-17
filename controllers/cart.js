import catchError from "../middlewares/catchError.js";
import cartModel from "../models/cart.js";
import productModel from "../models/Products.js";
import appError from "../utils/appError.js";
import statusText from "../utils/statusText.js";

const addToCart = catchError(async (req, res, next) => {
  const userId = req.user.id;
  const { productId } = req.body;

  if (!productId) {
    return next(appError.create("productId is required", 400, statusText.FAIL));
  }

  const product = await productModel.findById(productId);
  if (!product) {
    return next(appError.create("Product not found", 404, statusText.FAIL));
  }

  // Check if product is in stock
  if (product.stock <= 0) {
    return next(
      appError.create("Product is out of stock", 400, statusText.FAIL)
    );
  }

  let cart = await cartModel.findOne({ userId });

  if (!cart) {
    // Create new cart with product (quantity = 1)
    cart = await cartModel.create({
      userId,
      items: [{ productId, quantity: 1 }],
      createdAt: Date.now(),
      lastUpdateAt: Date.now(),
    });
  } else {
    // Check if product already exists in cart
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex > -1) {
      // Product already in cart, return error
      return next(
        appError.create(
          "Product is already in your cart",
          400,
          statusText.FAIL
        )
      );
    } else {
      // Add product to cart (quantity = 1)
      cart.items.push({ productId, quantity: 1 });
    }

    cart.lastUpdateAt = Date.now();
    await cart.save();
  }

  // Populate the cart for response
  const populatedCart = await cartModel
    .findOne({ userId })
    .populate("items.productId");

  res.status(201).json({
    status: statusText.SUCCESS,
    message: "Product added to cart successfully",
    code: 201,
    data: { cart: populatedCart },
  });
});

const getMyCart = catchError(async (req, res, next) => {
  const userId = req.user.id;
  const cart = await cartModel
    .findOne({ userId })
    .populate({
      path: "items.productId",
      select: "name price stock image category brand description evaluation",
    });

  if (!cart) {
    return res.status(200).json({
      status: statusText.SUCCESS,
      message: "Your cart is empty",
      code: 200,
      data: { cart: { items: [], userId } },
    });
  }

  // Check stock for each item in cart
  const itemsWithStockCheck = await Promise.all(
    cart.items.map(async (item) => {
      const product = await productModel.findById(item.productId._id);
      return {
        ...item.toObject(),
        productId: {
          ...item.productId.toObject(),
          isOutOfStock: product.stock <= 0,
          availableStock: product.stock,
        },
      };
    })
  );

  cart.items = itemsWithStockCheck;

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

  // Input validation
  if (!productId) {
    return next(appError.create("Product ID is required", 400, statusText.FAIL));
  }

  if (quantity === undefined) {
    return next(appError.create("Quantity is required", 400, statusText.FAIL));
  }

  const qty = parseInt(quantity);
  
  if (isNaN(qty)) {
    return next(appError.create("Quantity must be a valid number", 400, statusText.FAIL));
  }

  if (qty < 0) {
    return next(appError.create("Quantity cannot be negative", 400, statusText.FAIL));
  }

  // Find user's cart
  const cart = await cartModel.findOne({ userId });
  if (!cart) {
    return next(appError.create("Cart not found", 404, statusText.FAIL));
  }

  // Find item in cart
  const itemIndex = cart.items.findIndex(item => 
    item.productId.toString() === productId
  );

  if (itemIndex === -1) {
    return next(appError.create("Product not found in cart", 404, statusText.FAIL));
  }

  // Get product info for stock validation
  const product = await productModel.findById(productId);
  if (!product) {
    return next(appError.create("Product no longer exists", 404, statusText.FAIL));
  }

  // Stock validation logic
  if (qty > 0) {
    // Only validate stock if adding/updating to positive quantity
    if (product.stock <= 0) {
      return next(
        appError.create(
          `"${product.name}" is out of stock. Please remove it from your cart.`,
          400,
          statusText.FAIL
        )
      );
    }

    if (qty > product.stock) {
      // Provide helpful message with available options
      const availableOptions = product.stock > 1 
        ? `Maximum available: ${product.stock} items` 
        : 'Only 1 item is available';
      
      return next(
        appError.create(
          `Insufficient stock for "${product.name}". ${availableOptions}.`,
          400,
          statusText.FAIL
        )
      );
    }
  }

  // Update cart
  if (qty === 0) {
    // Remove item
    cart.items.splice(itemIndex, 1);
  } else {
    // Update quantity
    cart.items[itemIndex].quantity = qty;
  }

  cart.lastUpdateAt = Date.now();
  await cart.save();

  // Return populated cart
  const populatedCart = await cartModel
    .findOne({ userId })
    .populate({
      path: 'items.productId',
      select: 'name price stock image category brand'
    });

  res.status(200).json({
    status: statusText.SUCCESS,
    message: qty === 0 
      ? 'Item removed from cart successfully' 
      : 'Cart quantity updated successfully',
    code: 200,
    data: { 
      cart: populatedCart,
      productInfo: {
        name: product.name,
        availableStock: product.stock,
        updatedQuantity: qty
      }
    },
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

// Optional: Remove out of stock items automatically
const cleanCart = catchError(async (req, res, next) => {
  const userId = req.user.id;
  const cart = await cartModel.findOne({ userId }).populate("items.productId");

  if (!cart) {
    return next(appError.create("Cart not found", 404, statusText.FAIL));
  }

  const originalLength = cart.items.length;
  
  // Filter out items with no stock
  cart.items = cart.items.filter(item => {
    return item.productId && item.productId.stock > 0;
  });

  if (cart.items.length < originalLength) {
    cart.lastUpdateAt = Date.now();
    await cart.save();
    
    const removedCount = originalLength - cart.items.length;
    
    return res.status(200).json({
      status: statusText.SUCCESS,
      message: `Removed ${removedCount} out-of-stock item(s) from your cart`,
      code: 200,
      data: { cart },
    });
  }

  res.status(200).json({
    status: statusText.SUCCESS,
    message: "All items in your cart are in stock",
    code: 200,
    data: { cart },
  });
});

export default {
  addToCart,
  getMyCart,
  updateCartById,
  clearCart,
  cleanCart, // Optional: export if you want to use it
};