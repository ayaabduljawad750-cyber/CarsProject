const joi = require("joi");
const asyncHandler = require("express-async-handler");
const { BookingMaintenance } = require("../models/bookMaintenance");
const { userModel } = require("../models/user");
const { message } = require("../utils/appError");
function validation(obj) {
  const schema = joi.object({
    user: joi.string().trim().min(3).max(100),
    userFullName: joi.string().trim().min(3).max(100),
    userTelephone: joi
      .string()
      .pattern(/^\d{11}$/)
      .required(),
    userEmail: joi.string().trim().min(3).max(100),
    role: joi.string().trim().min(3).max(100).default("user"),
    carModel: joi.string().min(4).required(),
    ModelYear: joi
      .string()
      .pattern(/^\d{4}$/)
      .required(),
    service: joi
      .string()
      .valid("Regular Service", "General Repair", "Other")
      .required(),
    comment: joi.string().trim().min(3).max(100),
  });
  return schema.validate(obj);
}

function validationUpdateBooking(obj) {
  const schema = joi.object({
    user: joi.string().trim().min(3).max(100),
    userFullName: joi.string().trim().min(3).max(100),
    userTelephone: joi.string().pattern(/^\d{11}$/),
    userEmail: joi.string().trim().min(3).max(100),
    carModel: joi.string().trim().min(3).max(100),
    ModelYear: joi.string().trim().min(4).max(100),
    service: joi.string().valid("Regular Service", "General Repair", "Other"),
    comment: joi.string().trim().min(3).max(100),
    role: joi.string().trim().min(3).max(100).default("user"),
    status: joi.string().trim().min(3).max(100).default("pending"),
  });
  return schema.validate(obj);
}

const makeNewBooking = asyncHandler(async (req, res) => {
  const { error } = validation(req.body);
  if (error) {
    return res.status(500).json({ message: error.details[0].message });
  }

  const book = new BookingMaintenance({
    user: req.body.user,
    userFullName: req.body.userFullName,
    userTelephone: req.body.userTelephone,
    userEmail: req.body.userEmail,
    carModel: req.body.carModel,
    ModelYear: req.body.ModelYear,
    service: req.body.service,
    comment: req.body.comment,
    role: req.body.role,
  });

  const result = await book.save();
     res.status(200).json({
       message: `Wait for the admin to review the request`,
       result,
     });

 
});

const editBooking = asyncHandler(async (req, res) => {
  const { error } = validationUpdateBooking(req.body);
  if (error) {
    return res.status(500).json({ message: error.details[0].message });
  }

  let book = await BookingMaintenance.findById(req.params.id);
  if (!book) {
    return res.status(400).json({ message: "User With This ID Is Not Found " });
  }
  book = await BookingMaintenance.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        user: req.body.user,
        userFullName: req.body.userFullName,
        userTelephone: req.body.userTelephone,
        userEmail: req.body.userEmail,
        carModel: req.body.carModel,
        ModelYear: req.body.ModelYear,
        service: req.body.service,
        comment: req.body.comment,
       
      },
    },
    {
      new: true,
    }
  );
  res.status(200).json(book);
});

const getBooks = asyncHandler(
    async(req,res)=>{
        const bookingList = await BookingMaintenance.find().populate("user" , ["firstName" , "token"]);
        res.status(200).json(bookingList);
    }
)

const deleteBooking = asyncHandler(
  async (req, res) => {
    const booking = BookingMaintenance.findById(req.params.id);
    if (booking) {
      await BookingMaintenance.findByIdAndDelete(req.params.id);
      res.status(200).json({messsage : "the book was deleted successfully"})
    } else {
        res.status(404).json({ message: "not found" });
    }
  }
)

const editStatus = asyncHandler(async (req, res) => {
   const book = await BookingMaintenance.findByIdAndUpdate(
     req.params.id,
     {
       $set: {
         service:req.body.service,
         role: req.body.role,
         status: req.body.status
       },
     },
     {
       new: true,
     }
  );


  res.status(200).json(
    { message: `Requst is ${req.body.status}`},
  );
});




// serviceController.js



module.exports = {
  validation,
  validationUpdateBooking,
  makeNewBooking,
  editBooking,
  getBooks,
  deleteBooking,
  editStatus,
};


