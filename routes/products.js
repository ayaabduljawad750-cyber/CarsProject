import express from "express";
const router = express.Router();
import {  
    CreateNewProduct,
    updateProduct,
    deleteProduct,
    getAllProducts,
    getProductById,
    getFilteredProducts
} from "../controllers/products";
import { auth } from "../middlewares/auth";

router.post("/", auth, CreateNewProduct);
router.put("/:id", auth, updateProduct);
router.delete("/:id", auth, deleteProduct);
router.get("/", getFilteredProducts);
router.get("/all", auth, getAllProducts);
router.get("/:id", getProductById);

export default router;
