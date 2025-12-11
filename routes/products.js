import express from "express";
import controlProduct from "../controllers/products.js";
import auth from "../middlewares/auth.js";
import authorize from "../middlewares/authorization.js";
import userRoles from "../utils/userRoles.js";
import uploadImage from "../middlewares/uploadImage.js";

const productRoute = express.Router();

productRoute.get("/",controlProduct.getProducts)
productRoute.post("/", auth,authorize(userRoles.SELLER), uploadImage.single("image"),controlProduct.createProduct);
productRoute.get("/:id",controlProduct.getProductById)
productRoute.put("/:id",auth,authorize(userRoles.SELLER),uploadImage.single("image"),controlProduct.updateProductById)
productRoute.delete("/:id",auth,authorize(userRoles.SELLER),controlProduct.deleteProductById)


export default productRoute;
