const express = require("express");
const {
  register,
  login,
  getUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  updatePasswordById,
  sendVerificationCode,
  verifyVerificationCode,
  changePassword
} = require("../controllers/user.js");

const userRoles = require("../utils/userRoles.js")

const {auth} = require("../middlewares/auth.js")
const {authorize} = require("../middlewares/authorization.js")

let userRoute = express.Router();

userRoute.post("/register", register);

userRoute.post("/login", login);

userRoute.get("/",auth, authorize(userRoles.ADMIN),getUsers);

userRoute.get("/get",auth,getUserById)

userRoute.get("/:id",auth,authorize(userRoles.ADMIN), getUserById);

userRoute.put("/update",auth,updateUserById)

userRoute.put("/update/password",auth,updatePasswordById)

userRoute.put("/:id",auth,authorize(userRoles.ADMIN), updateUserById);

userRoute.delete("/delete",auth,deleteUserById)

userRoute.delete("/:id",auth,authorize(userRoles.ADMIN), deleteUserById);

// for forget password function 
userRoute.post("/send/verificationCode",sendVerificationCode)
userRoute.post("/verify/verificationCode",verifyVerificationCode)
userRoute.post("/change/password",changePassword)

module.exports = userRoute;
