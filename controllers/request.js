const catchError = require("../middlewares/catchError");
const requestModel = require("../models/request");
const userModel = require("../models/user");
const appError = require("../utils/appError");
const statusText = require("../utils/statusText");

const getRequests = catchError(async (req, res, next) => {
  let requests;
  if (req.query.status) {
    requests = await requestModel.find({ status: req.query.status });
  } else if (req.query.requestContent) {
    requests = await requestModel.find({
      requestContent: req.query.requestContent,
    });
  } else {
    requests = await requestModel.find();
  }

  res.status(200).json({
    status: statusText.SUCCESS,
    message: "requests are here",
    code: 200,
    data: { requests },
  });
});

const createRequest = catchError(async (req, res, next) => {
  const userId = req.user.id;
  const { requestContent } = req.body;

  if (!requestContent) {
    const error = appError.create(
      "requestContent is required",
      400,
      statusText.ERROR
    );
    next(error);
    return;
  }

  await requestModel.insertOne({ userId, requestContent });

  res.status(201).json({
    status: statusText.SUCCESS,
    message: "request sent successfully",
    code: 201,
    data: null,
  });
});

const getRequestById = catchError(async (req, res, next) => {
  const requestId = req.params.id;

  const request = await requestModel.findById(requestId);
  if (!request) {
    const error = appError.create("request is not found", 404, statusText.FAIL);
    next(error);
    return;
  }

  res.status(200).json({
    status: statusText.SUCCESS,
    message: "this is the request",
    code: 200,
    data: { request },
  });
});

const updateStatusRequestById = catchError(async (req, res, next) => {
  const requestId = req.params.id;

  const request = await requestModel.findById(requestId);
  if (!request) {
    const error = appError.create("request is not found", 404, statusText.FAIL);
    next(error);
    return;
  }

  const { status } = req.body;
  if (!status) {
    const error = appError.create("status is required", 400, statusText.ERROR);
    next(error);
    return;
  }

  await requestModel.updateOne(
    { _id: requestId },
    { $set: { status: status } }
  );

  if (status == "Acceptable") {
    await userModel.updateOne(
      { _id: request.userId },
      { $set: { role: request.requestContent } }
    );

    await requestModel.deleteMany({
      userId: request.userId,
      status: "Pending",
    });
  }

  res.status(200).json({
    status: statusText.SUCCESS,
    message: "updated status successfully",
    code: 200,
    data: null,
  });
});

const deleteRequestById = catchError(async (req, res, next) => {
  const requestId = req.params.id;
  const request = await requestModel.findById(requestId);
  if (!request) {
    const error = appError.create("request is not found", 404, statusText.FAIL);
    next(error);
    return;
  }

  await requestModel.deleteOne({ _id: requestId });

  res.status(200).json({
    status: statusText.SUCCESS,
    message: "deleted request successfully",
    code: 200,
    data: null,
  });
});

const getMyRequests = catchError(async (req, res, next) => {
  const userId = req.user.id;
  let myRequests;
  if (req.query.status) {
    myRequests = await requestModel.find({ userId, status: req.query.status });
  } else if (req.query.requestContent) {
    myRequests = await requestModel.find({
      userId,
      requestContent: req.query.requestContent,
    });
  } else {
    myRequests = await requestModel.find({ userId });
  }

  res.status(200).json({
    status: statusText.SUCCESS,
    message: "your requests are here",
    code: 200,
    data: { myRequests },
  });
});

const getMyRequestById = catchError(async (req, res, next) => {
  const requestId = req.params.id;
  const userId = req.user.id;

  const request = await requestModel.findById(requestId);
  if (!request) {
    const error = appError.create("request is not found", 404, statusText.FAIL);
    next(error);
    return;
  }

  if (request.userId != userId) {
    const error = appError.create(
      "You can not get this request because this request is not yours",
      401,
      statusText.FAIL
    );
    next(error);
    return;
  }

  res.status(200).json({
    status: statusText.SUCCESS,
    message: "this is your request",
    code: 200,
    data: { request },
  });
});

const updateMyRequestById = catchError(async (req, res, next) => {
  const requestId = req.params.id;
  const userId = req.user.id;

  const request = await requestModel.findById(requestId);
  if (!request) {
    const error = appError.create("request is not found", 404, statusText.FAIL);
    next(error);
    return;
  }

  if (request.userId != userId) {
    const error = appError.create(
      "You can not update this request because this request is not yours",
      401,
      statusText.FAIL
    );
    next(error);
    return;
  }

  const { requestContent } = req.body;
  if (!requestContent) {
    const error = appError.create("requestContent is required");
    next(error);
    return;
  }

  await requestModel.updateOne(
    { _id: requestId },
    { $set: { requestContent } }
  );

  res.status(200).json({
    status: statusText.SUCCESS,
    message: "update your request successfully",
    code: 200,
    data: null,
  });
});

const deleteMyRequestById = catchError(async (req, res, next) => {
  const requestId = req.params.id;
  const userId = req.user.id;

  const request = await requestModel.findById(requestId);
  if (!request) {
    const error = appError.create("request is not found", 404, statusText.FAIL);
    next(error);
    return;
  }

  if (request.userId != userId) {
    const error = appError.create(
      "You can not delete this request because this request is not yours",
      401,
      statusText.FAIL
    );
    next(error);
    return;
  }

  await requestModel.deleteOne({ _id: requestId });

  res.status(200).json({
    status: statusText.SUCCESS,
    message: "deleted request successfully",
    code: 200,
    data: null,
  });
});

module.exports = {
  getRequests,
  createRequest,
  getRequestById,
  updateStatusRequestById,
  deleteRequestById,
  getMyRequests,
  getMyRequestById,
  updateMyRequestById,
  deleteMyRequestById,
};
