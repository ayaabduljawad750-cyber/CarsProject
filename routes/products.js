const express = require("express");
const router = express.Router();
const {  
    CreateNewProduct,
    updateProduct,
    deleteProduct,
    getAllProducts,
    getProductById,
    getFilteredProducts 
} = require("../controllers/products");
const { auth } = require("../middlewares/auth");

router.post("/", auth, CreateNewProduct);
router.put("/:id", auth, updateProduct);
router.delete("/:id", auth, deleteProduct);
router.get("/", getFilteredProducts);
router.get("/all", auth, getAllProducts);
router.get("/:id", getProductById);

module.exports = router;
