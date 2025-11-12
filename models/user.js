const mongoose = require("mongoose");
const { isName, isEmail, isStrongPassword } = require("../utils/validate.js");
const userRoles = require("../utils/userRoles.js");

const userSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "First name is required"],
    validate: [isName, "Invalid Name"],
  },
  lastName: {
    type: String,
    required: [true, "Last name is required"],
    validate: [isName, "Invalid Name"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: [true, "email already exists"],
    validate: [isEmail, "Invalid Email"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    validate: [isStrongPassword, "Not strong password"],
  },
  role: {
    type: String,
    enum: [userRoles.ADMIN, userRoles.USER],
    default: userRoles.USER,
  },
  token: {
    type: String,
  },
});

let userModel = mongoose.model("User", userSchema);

module.exports = userModel;
