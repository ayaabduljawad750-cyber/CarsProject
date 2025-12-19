import express from "express";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";
import * as orderController from "../controllers/order.js";

const router = express.Router();

// Order routes
router.post("/", auth, orderController.createOrder);
router.get("/my", auth, orderController.getMyOrders);
// Admin routes
router.get("/", auth, isAdmin, orderController.filterOrders);
router.get("/all", auth, isAdmin, orderController.getAllOrders);

router.patch("/cancel/:id", auth, orderController.cancelMyOrder); // User cancels their order
router.get("/:id", auth, orderController.getOrderById);


router.patch("/status/:id", auth, isAdmin, orderController.updateOrderStatus); // Admin updates status
router.delete("/:id", auth, isAdmin, orderController.deleteOrder);

export default router;