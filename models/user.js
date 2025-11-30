import mongoose from "mongoose";
import validation from "../utils/validate.js";
import userRoles from "../utils/userRoles.js";

const userSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "First name is required"],
    validate: [validation.isName, "Invalid Name"],
  },
  lastName: {
    type: String,
    required: [true, "Last name is required"],
    validate: [validation.isName, "Invalid Name"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: [true, "email already exists"],
    validate: [validation.isEmail, "Invalid Email"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    validate: [validation.isStrongPassword, "Not strong password"],
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

export default userModel;
