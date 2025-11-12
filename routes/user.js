const express = require("express");
const {
  register,
  login,
  getUsers,
  getUserById,
  updateUserById,
  deleteUserById,
} = require("../controllers/user.js");

let userRoute = express.Router();

userRoute.post("/register", register);

userRoute.post("/login", login);

userRoute.get("/", getUsers);

userRoute.get("/:id", getUserById);

userRoute.put("/:id", updateUserById);

userRoute.delete("/:id", deleteUserById);

module.exports = userRoute;
