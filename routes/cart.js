import express from "express";
import cartControl from "../controllers/cart.js";
import  auth  from "../middlewares/auth.js";

const cartRoute = express.Router();

cartRoute.post("/",auth,cartControl.addToCart);
cartRoute.get("/",auth,cartControl.getMyCart);
cartRoute.put("/",auth,cartControl.updateCartById)
cartRoute.delete("/",auth,cartControl.clearCart)



export default cartRoute;