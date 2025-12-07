import express from "express";
import auth from "../middlewares/auth.js";
import *as orderController from "../controllers/order.js";

let orderRoute = express.Router()

orderRoute.post("/",auth,orderController.createOrder);

orderRoute.get("/",orderController.filterOrders);

orderRoute.get("/all", orderController.getAllOrders); 

orderRoute.get("/:id", orderController.getOrderById);

orderRoute.patch("/status/:id", orderController.updateOrderStatus);

orderRoute.patch("/updateItem/:id", orderController.updateOrderItem);

orderRoute.patch("/updateItem/:userId/:orderId", orderController.updateItemByUser);

orderRoute.get("/user/:userId", orderController.getOrdersByUser);

orderRoute.delete("/:id", orderController.deleteOrder);

orderRoute.delete("/user/:userId/:orderId", orderController.deleteOrderByUser);

export default orderRoute