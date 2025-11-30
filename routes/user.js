import express  from "express";
import userController from "../controllers/user.js";

let userRoute = express.Router();

userRoute.post("/register", userController.register);

userRoute.post("/login", userController.login);

userRoute.get("/", userController.getUsers);

userRoute.get("/:id", userController.getUserById);

userRoute.put("/:id", userController.updateUserById);

userRoute.delete("/:id", userController.deleteUserById);

export default userRoute;
