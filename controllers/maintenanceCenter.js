import catchError from "../middlewares/catchError.js";
import maintenanceCenterModel from"../models/maintenanceCenter.js";
import appError from "../utils/appError.js";
import statusText from "../utils/statusText.js";
import {
  isCenterNameOrLocation,
  isPhone,
  isEmail,
} from "../utils/validate.js";

const addCenter = catchError(async (req, res, next) => {
  const { name, location, phone, email } = req.body;
  const userId = req.user.id;
  if (!name || !location || !phone || !email) {
    const error = appError.create(
      "name , location , phone , email are required"
    );
    next(error);
    return;
  }
  isCenterNameOrLocation(name);
  isCenterNameOrLocation(location);
  isPhone(phone);
  isEmail(email);

  const center = await maintenanceCenterModel.findOne({ addBy: userId });

  if (center) {
    const error = appError.create(
      "you already created center before",
      401,
      statusText.FAIL
    );
    next(error);
    return;
  }

  await maintenanceCenterModel.insertOne({
    name,
    location,
    phone,
    email,
    addedBy: userId,
  });

  res.status(201).json({
    status: statusText.SUCCESS,
    message: "created center successfully",
    code: 201,
    data: null,
  });
});

const getCenters = catchError(async (req, res, next) => {
  let search = "";
  let centers = [];
  if (req.query.name) {
    search = req.query.name;
    centers = await maintenanceCenterModel.find({
      name: { $regex: search, $options: "i" },
    });
  } else if (req.query.location) {
    search = req.query.location;
    centers = await maintenanceCenterModel.find({
      location: { $regex: search, $options: "i" },
    });
  } else if (req.query.search) {
    search = req.query.search;
    centers = await maintenanceCenterModel.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        ,
        { location: { $regex: search, $options: "i" } },
      ],
    });
  } else {
    centers = await maintenanceCenterModel.find();
  }

  res.status(200).json({
    status: statusText.SUCCESS,
    message: "centers are here",
    code: 200,
    data: { centers },
  });
});

const getCenterById = catchError(async (req, res, next) => {
  const centerId = req.params.id;
  const center = await maintenanceCenterModel.findById(centerId);
  if (!center) {
    const error = appError.create("center is not found", 404, statusText.FAIL);
    next(error);
    return;
  }
  res.status(200).json({
    status: statusText.SUCCESS,
    message: "center is here",
    code: 200,
    data: { center },
  });
});

const updateCenterById = catchError(async (req, res, next) => {
  const centerId = req.params.id;
  const center = await maintenanceCenterModel.findById(centerId);
  if (!center) {
    const error = appError.create("center is not found", 404, statusText.FAIL);
    next(error);
    return;
  }

  const userId = req.user.id;
  if (center.addedBy != userId) {
    const error = appError.create(
      "this center is not yours so you can not update it",
      401,
      statusText.ERROR
    );
    next(error)
    return;
  }
  await maintenanceCenterModel.updateOne({_id:centerId},{$set:{...req.body}})

  res.status(200).json({status:statusText.SUCCESS,message:"updated successfully",code:200,data:null})
});

const deleteCenterById = catchError(async (req,res,next)=>{
    const centerId = req.params.id;
  const center = await maintenanceCenterModel.findById(centerId);
  if (!center) {
    const error = appError.create("center is not found", 404, statusText.FAIL);
    next(error);
    return;
  }

  const userId = req.user.id;
  if (center.addedBy != userId) {
    const error = appError.create(
      "this center is not yours so you can not update it",
      401,
      statusText.ERROR
    );
    next(error)
    return;
  }

  await maintenanceCenterModel.deleteOne({_id:centerId})

  res.status(200).json({status:statusText.SUCCESS,message:"deleted successfully",code:200,data:null})

})

const getMyCenter = catchError(async (req, res, next) => {
  const userId = req.user.id;
  const center = await maintenanceCenterModel.findOne({ addedBy: userId });
  
  // It is okay if center is null (means they haven't created one yet)
  res.status(200).json({
    status: statusText.SUCCESS,
    data: { center }
  });
});

export default {
  addCenter,getCenters,getCenterById,updateCenterById,deleteCenterById,getMyCenter
}
