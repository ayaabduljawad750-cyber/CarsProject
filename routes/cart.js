import express from ("express");
const router = express.Router();
import {  
    getAllCart,
    getCartById,
    getCartByUserId,
    updateCartById,
    updateCartByUserId,
    deleteById,
    deleteByUserId,
    createCart
} from ("../controllers/cart");
import { auth } from ("../middlewares/auth");

router.post("/",auth, createCart);
router.put("/user/:userId", auth, updateCartByUserId);
router.put("/:id", auth, updateCartById);
router.delete("/user/:userId",auth, deleteByUserId);
router.delete("/:id", auth, deleteById);
router.get("/", auth, getAllCart);
router.get("/user/:userId",auth, getCartByUserId);
router.get("/:id",auth, getCartById);


module.exports = router;