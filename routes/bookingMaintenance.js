import express from "express";
import controllerBookings from "../controllers/BookingControllers.js";
import auth from "../middlewares/auth.js";
import authorize from "../middlewares/authorization.js";
import userRoles from "../utils/userRoles.js";

const bookingRouter = express.Router();

// 1. User Creates Booking
bookingRouter.post("/", auth, controllerBookings.makeNewBooking);

// 2. Maintenance Center Gets THEIR incoming requests
// Note: This route must come BEFORE /:id
bookingRouter.get("/my-incoming-requests", auth, authorize(userRoles.MaintenanceCenter), controllerBookings.getCenterBookings);

// 3. User Gets THEIR OWN history
bookingRouter.get("/my-history", auth, controllerBookings.getMyBookingsAsUser);

// 4. Update Status (Accept/Reject)
bookingRouter.patch("/:id/status", auth, authorize(userRoles.MaintenanceCenter), controllerBookings.editStatus);

// 5. Delete
bookingRouter.delete("/:id", auth, controllerBookings.deleteBooking);

export default bookingRouter;