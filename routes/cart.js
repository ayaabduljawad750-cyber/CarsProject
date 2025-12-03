import express from ("express");
const cartRoute = express.Router();
import cartControl from ("../controllers/cart.js");
import  auth  from ("../middlewares/auth.js");

cartRoute.post("/",auth, cartControl.createCart);
cartRoute.put("/user/:userId", auth, cartControl.updateCartByUserId);
cartRoute.put("/:id", auth, cartControl.updateCartById);
cartRoute.delete("/user/:userId",auth, cartControl.deleteByUserId);
cartRoute.delete("/:id", auth, cartControl.deleteById);
cartRoute.get("/", auth, cartControl.getAllCart);
cartRoute.get("/user/:userId",auth, cartControl.getCartByUserId);
cartRoute.get("/:id",auth, cartControl.getCartById);


export default cartRoute;