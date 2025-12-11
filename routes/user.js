import express from "express";
import userControl from "../controllers/user.js";

import userRoles from "../utils/userRoles.js";

import auth from "../middlewares/auth.js";
import authorize from "../middlewares/authorization.js";
import uploadImage from "../middlewares/uploadImage.js";

let userRoute = express.Router();

userRoute.post("/register", userControl.register);

userRoute.post(
  "/register/:role",
  uploadImage.single("commercial"),
  userControl.register
);

userRoute.post("/login", userControl.login);

userRoute.get("/", auth, authorize(userRoles.ADMIN), userControl.getUsers);

userRoute.get("/get", auth, userControl.getUserById);

userRoute.get(
  "/:id",
  auth,
  authorize(userRoles.ADMIN),
  userControl.getUserById
);

userRoute.put("/update", auth, userControl.updateUserById);

userRoute.put("/update/password", auth, userControl.updatePasswordById);

userRoute.put(
  "/:id",
  auth,
  authorize(userRoles.ADMIN),
  userControl.updateUserById
);

userRoute.delete("/delete", auth, userControl.deleteUserById);

userRoute.delete(
  "/:id",
  auth,
  authorize(userRoles.ADMIN),
  userControl.deleteUserById
);

// for forget password function
userRoute.post("/send/verificationCode", userControl.sendVerificationCode);
userRoute.post("/verify/verificationCode", userControl.verifyVerificationCode);
userRoute.post("/change/password", userControl.changePassword);

export default userRoute;
