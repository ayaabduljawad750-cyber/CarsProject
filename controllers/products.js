import catchError from "../middlewares/catchError.js";
import productModel from "../models/Products.js";
import appError from "../utils/appError.js";
import statusText from "../utils/statusText.js";
import { testText } from "../utils/validate.js";

const createProduct = catchError(async (req, res, next) => {
  const sellerId = req.user.id;
  const { name, brand, carModel, price, stock, description, category } =
    req.body;

  if (!name || !price || !stock || !category) {
    const error = appError.create(
      "name , price , stock and category are required",
      400,
      statusText.FAIL
    );
    next(error);
    return;
  }

  testText(name);
  if (brand) {
    testText(brand);
  }
  if (carModel) {
    testText(carModel);
  }
  if (price <= 0) {
    const error = appError.create(
      "Price must be greater than 0",
      400,
      statusText.FAIL
    );
    next(error);
    return;
  }
  if (stock < 0) {
    const error = appError.create(
      "Stock must be 0 or more",
      400,
      statusText.FAIL
    );
    next(error);
    return;
  }
  const allowedCategories = [
    "Spare parts",
    "Tyres",
    "Engine oil",
    "Batteries",
    "Liquids",
  ];
  if (!allowedCategories.includes(category)) {
    const error = appError.create(
      `${category} is invalid category`,
      400,
      statusText.FAIL
    );
    next(error);
    return;
  }

  if (!req.file) {
    const error = appError.create(
      "Product image is required",
      400,
      statusText.FAIL
    );
    next(error);
    return;
  }

  const product = {
    name,
    brand,
    carModel,
    price,
    stock,
    description,
    category,
    sellerId,
    image: {
      data: req.file.buffer,
      contentType: req.file.mimetype,
    },
  };

  await productModel.insertOne({ ...product });

  res.status(201).json({
    status: statusText.SUCCESS,
    message: "create product successfully",
    code: 201,
    data: product,
  });
});

const getProducts = catchError(async (req, res, next) => {
  const {
    category,
    brand,
    carModel,
    minPrice,
    maxPrice,
    sortBy,
    search,
    page = 1,
    limit = 8,
  } = req.query;

  const filter = {};

  /* ================= SEARCH FUNCTIONALITY ================= */
  if (search) {
    const searchRegex = new RegExp(search, "i");
    filter.$or = [
      { name: searchRegex },
      { brand: searchRegex },
      { carModel: searchRegex }
    ];
  }

  /* ================= FILTERS ================= */
  if (category) {
    filter.category = category;
  }

  if (brand && !search) {
    filter.brand = new RegExp(brand, "i");
  }

  if (carModel && !search) {
    filter.carModel = new RegExp(carModel, "i");
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  /* ================= SORTING ================= */
  let sort = {};
  const sortOptions = {
    "high-eval": { evaluation: -1 },
    "low-eval": { evaluation: 1 },
    "name-asc": { name: 1 },
    "name-desc": { name: -1 },
    "price-high": { price: -1 },
    "price-low": { price: 1 },
    "latest": { createdAt: -1 },
    "oldest": { createdAt: 1 }
  };
  
  if (sortBy && sortOptions[sortBy]) {
    sort = sortOptions[sortBy];
  }

  /* ================= PAGINATION ================= */
  const skip = (page - 1) * limit;

  const products = await productModel
    .find(filter)
    .sort(sort)
    .skip(skip)
    .limit(Number(limit))
    .populate("sellerId", "firstName lastName email");

  const formattedProducts = products.map(p => ({
    ...p._doc,
    image: p.image && p.image.data
      ? {
          contentType: p.image.contentType,
          data: p.image.data.toString("base64"),
        }
      : null,
  }));

  const total = await productModel.countDocuments(filter);
  
  res.status(200).json({
    status: statusText.SUCCESS,
    message: "products are here",
    code: 200,
    data: {
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      products: formattedProducts,
    },
  });
});

const getMyProducts = catchError(async (req, res, next) => {
  const sellerId = req.user.id;

  const {
    category,
    brand,
    carModel,
    minPrice,
    maxPrice,
    inStock,
    sortBy,
    search,
    page = 1,
    limit = 10,
  } = req.query;

  const filter = { sellerId: sellerId };

  /* ================= FILTERS ================= */

  if (category) {
    filter.category = category;
  }

  if (search) {
    const searchRegex = new RegExp(search, "i");
    filter.$or = [
      { name: searchRegex },
      { brand: searchRegex },
      { carModel: searchRegex }
    ];
  } else {
    if (brand) filter.brand = new RegExp(brand, "i");
    if (carModel) filter.carModel = new RegExp(carModel, "i");
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  if (inStock === "true") {
    filter.stock = { $gt: 0 };
  }

  /* ================= SORTING ================= */
  let sort = {};

  if (sortBy === "name-asc") sort.name = 1;
  else if (sortBy === "name-desc") sort.name = -1;
  else if (sortBy === "price-high") sort.price = -1;
  else if (sortBy === "price-low") sort.price = 1;
  else if (sortBy === "oldest") sort.createdAt = 1;
  else sort.createdAt = -1;

  /* ================= PAGINATION ================= */
  const skip = (page - 1) * limit;

  const products = await productModel
    .find(filter)
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));



  const total = await productModel.countDocuments(filter);

  res.status(200).json({
    status: statusText.SUCCESS,
    message: "your products retrieved successfully",
    code: 200,
    data: {
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      products,
    },
  });
});

const getProductById = catchError(async (req, res, next) => {
  const productId = req.params.id;
  const product = await productModel.findById(productId).populate("sellerId", "firstName lastName email");
  if (!product) return next(appError.create("Product not found", 404, statusText.FAIL));

  const formattedProduct = {
    ...product._doc,
    image: product.image ? {
      contentType: product.image.contentType,
      data: product.image.data.toString("base64"),
    } : null,
  };

  res.status(200).json({
    status: statusText.SUCCESS,
    message: "product is here",
    code: 200,
    data: { product: formattedProduct },
  });
});


const updateProductById = catchError(async (req, res, next) => {
  const userId = req.user.id;
  const productId = req.params.id;
  const product = await productModel.findById(productId);
  if (!product) {
    const error = appError.create("Product not found", 404, statusText.FAIL);
    next(error);
    return;
  }
  if (product.sellerId != userId) {
    const error = appError.create(
      "this product is not yours so you can not update it",
      401,
      statusText.FAIL
    );
    next(error);
    return;
  }

  const updates = req.body;
  if (updates.name) {
    testText(updates.name);
  }
  if (updates.brand) {
    testText(updates.brand);
  }
  if (updates.carModel) {
    testText(updates.carModel);
  }
  if (updates.price && updates.price <= 0) {
    const error = appError.create(
      "Price must be greater than 0",
      400,
      statusText.FAIL
    );
    next(error);
    return;
  }
  if (updates.stock && updates.stock < 0) {
    const error = appError.create(
      "Stock cannot be negative",
      400,
      statusText.FAIL
    );
    next(error);
    return;
  }
  if (updates.category) {
    const allowedCategories = [
      "Spare parts",
      "Tyres",
      "Engine oil",
      "Batteries",
      "Liquids",
    ];
    if (!allowedCategories.includes(updates.category)) {
      const error = appError.create("Invalid category", 400, statusText.FAIL);
      next(error);
      return;
    }
  }

  if (req.file) {
    updates.image = {
      data: req.file.buffer,
      contentType: req.file.mimetype,
    };
  }

  updates.lastUpdateAt = Date.now();

  await productModel.findByIdAndUpdate(productId, updates, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: statusText.SUCCESS,
    message: "update successfully",
    code: 200,
    data: null,
  });
});

const deleteProductById = catchError(async (req, res, next) => {
  const userId = req.user.id;
  const productId = req.params.id;
  const product = await productModel.findById(productId);
  if (!product) {
    const error = appError.create("Product not found", 404, statusText.FAIL);
    next(error);
    return;
  }
  if (product.sellerId != userId) {
    const error = appError.create(
      "this product is not yours so you can not delete it",
      401,
      statusText.FAIL
    );
    next(error);
    return;
  }

  await productModel.findByIdAndDelete(productId)

  res.status(200).json({
    status: statusText.SUCCESS,
    message: "deleted successfully",
    code: 200,
    data: null,
  });
});

export default {
  createProduct,
  getProducts,
  updateProductById,
  getProductById,
  getMyProducts,
  deleteProductById
};
