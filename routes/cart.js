const express = require("express");
const router = express.Router();
const {  getAllCart,
    getCartById,
    getCartByUserId,
    updateCartById,
    updateCartByUserId,
    deleteById,
    deleteByUserId,
    createcart
} = require("../controllers/cart");
const { auth } = require("../middlewares/auth");

router.post("/",auth, createcart);
router.put("/user/:userId", auth, updateCartByUserId);
router.put("/:id", auth, updateCartById);
router.delete("/user/:userId",auth, deleteByUserId);
router.delete("/:id", auth, deleteById);
router.get("/", auth, getAllCart);
router.get("/user/:userId",auth, getCartByUserId);
router.get("/:id",auth, getCartById);


module.exports = router;