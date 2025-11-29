const express = require("express");
const asyncHandler = require("express-async-handler");
const {BookingMaintenance} = require("../models/bookMaintenance");
const {validation ,validationUpdateBooking} = require("../controllers/BookingControllers");
const router =express.Router();
const { userModel } = require("../models/user")
const {makeNewBooking , editBooking , getBooks , deleteBooking ,editStatus} = require("../controllers/BookingControllers")

router.get("/" , getBooks)

router.post ("/" , makeNewBooking);

router.put("/:id", editBooking)

router.delete("/:id" , deleteBooking)

router.put("/completedBookings/:id", editStatus);

module.exports = router