const mongoose = require("mongoose");
const { isEmail } = require("../utils/validate.js");
// const {userModel} = require("../models/user.js");
// console.log( mongoose.Schema.Types.String.get("firstN"))
const BookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 100,
    //   required: true,
    },
    userFullName: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 100,
      required: true,
    },
    userTelephone: {
      type: String,
      trim: true,
      minlength: 11,
      maxlength: 100,
      required: true,
    },
    userEmail: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 100,
      validate: [isEmail, "Invalid Email"],
    },
    carModel: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 100,
      required: true,
      default: "4000",
    },
    ModelYear: {
      type: Number,
      trim: true,
      minlength: 4,
      required: true,
      default: "2022",
    },
    service: {
      type: String,
      trim: true,
      minlength: 3,
      required: true,
      enum: ["Regular Service", "General Repair", "Other"],
      required: true,
    },
    comment: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 200,
      default: "There are no comments",
    },

    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);


const BookingMaintenance = mongoose.model("BookingMaintenance" , BookingSchema)
module.exports = {BookingMaintenance}