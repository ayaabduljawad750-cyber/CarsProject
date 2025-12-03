import express from "express";
import controlProduct from "../controllers/products.js";
import auth from "../middlewares/auth.js";

const productRoute = express.Router();

productRoute.post("/", auth, controlProduct.CreateNewProduct);
productRoute.put("/:id", auth, controlProduct.updateProduct);
productRoute.delete("/:id", auth, controlProduct.deleteProduct);
productRoute.get("/", controlProduct.getFilteredProducts);
productRoute.get("/all", auth, controlProduct.getAllProducts);
productRoute.get("/:id", controlProduct.getProductById);

export default productRoute;
