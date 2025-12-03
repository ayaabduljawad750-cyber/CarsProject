import express from"express";
import asyncHandler from"express-async-handler";
import BookingMaintenance from"../models/bookMaintenance.js";
// import {validation ,validationUpdateBooking} from"../controllers/BookingControllers.js";
const bookingRouter =express.Router();
import userModel from"../models/user.js"
import controllerBookings from"../controllers/BookingControllers.js"

bookingRouter.get("/" , controllerBookings.getBooks)

bookingRouter.post ("/" , controllerBookings.makeNewBooking);

bookingRouter.put("/:id", controllerBookings.editBooking)

bookingRouter.delete("/:id" , controllerBookings.deleteBooking)

bookingRouter.put("/completedBookings/:id", controllerBookings.editStatus);

export default bookingRouter