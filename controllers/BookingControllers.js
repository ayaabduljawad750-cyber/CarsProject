import joi from "joi";
import asyncHandler from "express-async-handler";
import BookingMaintenance from "../models/bookMaintenance.js";
import maintenanceCenterModel from "../models/maintenanceCenter.js"; // Import Center Model

// --- VALIDATION SCHEMAS ---

function validation(obj) {
  const schema = joi.object({
    // IMPORTANT: Booking must be linked to a specific Center
    maintenanceCenterId: joi.string().required(), 
    
    // User info usually comes from token, but validation for body inputs:
    userFullName: joi.string().trim().min(3).max(100).required(),
    userTelephone: joi.string().pattern(/^\d{11}$/).required(),
    userEmail: joi.string().email().trim().min(3).max(100),
    
    carModel: joi.string().min(2).required(),
    ModelYear: joi.number().integer().min(1900).max(2030).required(),
    service: joi.string().valid("Regular Service", "General Repair", "Other").required(),
    comment: joi.string().trim().allow("").max(200),
    role: joi.string(),
    user: joi.string() // Optional in validation, we get it from req.user
  });
  return schema.validate(obj);
}

function validationUpdateBooking(obj) {
  const schema = joi.object({
    status: joi.string().valid("Pending", "Accepted", "Rejected"),
    // Add other fields if you allow editing them
  });
  return schema.validate(obj);
}

// --- CONTROLLERS ---

// 1. User Creates a Booking
const makeNewBooking = asyncHandler(async (req, res) => {
  // Validate Inputs
  const { error } = validation(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // Create Object
  const book = new BookingMaintenance({
    user: req.user.id, // SECURE: Get ID from the logged-in user's token
    maintenanceCenterId: req.body.maintenanceCenterId, // LINK: Send to specific center
    
    userFullName: req.body.userFullName,
    userTelephone: req.body.userTelephone,
    userEmail: req.body.userEmail,
    carModel: req.body.carModel,
    ModelYear: req.body.ModelYear,
    service: req.body.service,
    comment: req.body.comment || "No comments",
    status: "Pending",
    role: "user"
  });

  const result = await book.save();
  
  res.status(201).json({
    message: "Booking sent successfully. Wait for the admin to review.",
    data: result,
  });
});

// 2. Maintenance Center Gets THEIR Bookings
const getCenterBookings = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Step A: Find which Center belongs to this logged-in User
  const center = await maintenanceCenterModel.findOne({ addedBy: userId });

  if (!center) {
    return res.status(404).json({ 
      message: "You have not created a Maintenance Center profile yet." 
    });
  }

  // Step B: Find bookings linked to this Center ID
  const bookingList = await BookingMaintenance.find({ maintenanceCenterId: center._id })
    .populate("user", ["firstName", "lastName", "email"]) // Get client details
    .sort({ createdAt: -1 }); // Show newest first

  res.status(200).json({
    status: "success",
    count: bookingList.length,
    data: bookingList
  });
});

// 3. Maintenance Center Updates Status (Accept/Reject)
const editStatus = asyncHandler(async (req, res) => {
  // Validate status input if needed
  if(req.body.status && !["Pending", "Accepted", "Rejected"].includes(req.body.status)){
      return res.status(400).json({ message: "Invalid status value" });
  }

  const book = await BookingMaintenance.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        status: req.body.status,
        // Optional: Allow center to update role or service if negotiated
        // service: req.body.service 
      },
    },
    { new: true } // Return the updated document
  );

  if (!book) {
    return res.status(404).json({ message: "Booking not found" });
  }

  res.status(200).json({ 
    message: `Request is now ${req.body.status}`,
    data: book 
  });
});

// 4. Admin or User Deletes Booking
const deleteBooking = asyncHandler(async (req, res) => {
  const booking = await BookingMaintenance.findById(req.params.id);
  
  if (booking) {
    await BookingMaintenance.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "The booking was deleted successfully" });
  } else {
    res.status(404).json({ message: "Booking not found" });
  }
});

// 5. Admin Gets ALL Bookings (Optional, for Super Admin Dashboard)
const getAllBooks = asyncHandler(async (req, res) => {
  const bookingList = await BookingMaintenance.find()
    .populate("user", ["firstName", "email"])
    .populate("maintenanceCenterId", "name"); // Also show which center it was for
  
  res.status(200).json(bookingList);
});

// 6. User Gets THEIR OWN Bookings (Optional, for User Dashboard)
const getMyBookingsAsUser = asyncHandler(async (req, res) => {
  const bookings = await BookingMaintenance.find({ user: req.user.id })
    .populate("maintenanceCenterId", ["name", "phone", "location"]);
    
  res.status(200).json(bookings);
});


export default {
  validation,
  validationUpdateBooking,
  makeNewBooking,
  getCenterBookings, // USE THIS for Maintenance Dashboard
  editStatus,        // USE THIS for Accepting/Rejecting
  deleteBooking,
  getAllBooks,
  getMyBookingsAsUser
};