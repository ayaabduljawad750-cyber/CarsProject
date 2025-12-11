import express from "express";
import cartControl from "../controllers/cart.js";
import  auth  from "../middlewares/auth.js";

const cartRoute = express.Router();

cartRoute.post("/",auth,cartControl.addToCart);



export default cartRoute;