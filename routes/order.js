import express from "express";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js"
import *as orderController from "../controllers/order.js";

let orderRoute = express.Router()

orderRoute.post("/",auth,orderController.createOrder);

orderRoute.get("/",auth,isAdmin,orderController.filterOrders);

orderRoute.get("/all" ,isAdmin, orderController.getAllOrders);

orderRoute.get("/My",auth, orderController.getMyOrders);

orderRoute.get("/:id",auth, orderController.getOrderById);

orderRoute.patch("/status/:id", auth, isAdmin, orderController.updateOrderStatus);

orderRoute.patch("/updateItem/:id", orderController.updateOrderItem);

orderRoute.patch("/updateItem/:userId/:orderId",auth, orderController.updateItemByUser);

orderRoute.get("/user/:userId", orderController.getOrdersByUser);

orderRoute.delete("/:id", auth, isAdmin, orderController.deleteOrder);

orderRoute.delete("/user/:userId/:orderId",auth, orderController.deleteOrderByUser);

export default orderRoute