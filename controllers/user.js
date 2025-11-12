const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const catchError = require("../middlewares/catchError.js");
const userModel = require("../models/user.js");
const appError = require("../utils/appError.js");
const statusText = require("../utils/statusText.js");
const { isEmail, isName, isStrongPassword } = require("../utils/validate.js");

const register = catchError(async (req, res, next) => {
  let { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password) {
    const error = appError.create(
      "firstName, lastName, email and password are required",
      400,
      statusText.FAIL
    );
    next(error);
    return;
  }

  try {
    isName(firstName);
    isName(lastName);
    isEmail(email);
    isStrongPassword(password);
  } catch (err) {
    next(err);
    return;
  }

  const oldUser = await userModel.findOne({ email });

  if (oldUser) {
    const error = appError.create("user already exists", 400, statusText.FAIL);
    next(error);
    return;
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const newUser = await userModel.insertOne({
    firstName,
    lastName,
    email,
    password: hashPassword,
  });

  res.status(201).json({
    status: statusText.SUCCESS,
    message: "You registered successfully",
    code: 201,
    data: { user: newUser },
  });
});

const login = catchError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const error = appError.create(
      "email and password are required",
      400,
      statusText.FAIL
    );
    next(error);
    return;
  }

  const user = await userModel.findOne({ email: email });

  if (!user) {
    const error = appError.create("user not found", 404, statusText.FAIL);
    next(error);
    return;
  }

  const matchedPassword = await bcrypt.compare(password, user.password);

  if (!matchedPassword) {
    const error = appError.create("password is wrong", 400, statusText.ERROR);
    next(error);
    return;
  }

  const token = jwt.sign(
    {
      email: user.email,
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET
  );

  // add token in user collection
  await userModel.updateOne({ email }, { $set: { token } });

  return res.json({
    status: statusText.SUCCESS,
    message: "You login successfully",
    code: 200,
    data: { token },
  });
});

const getUsers = catchError(async (req, res, next) => {
  let users;
  let search;
  if (req.query.firstName) {
    search = req.query.firstName;
    users = await userModel.find(
      { firstName: { $regex: search, $options: "i" } },
      { password: false }
    );
  } else if (req.query.lastName) {
    search = req.query.lastName;
    users = await userModel.find(
      { lastName: { $regex: search, $options: "i" } },
      { password: false }
    );
  } else if (req.query.email) {
    search = req.query.email;
    users = await userModel.find(
      { email: { $regex: search, $options: "i" } },
      { password: false }
    );
  } else if (req.query.search) {
    search = req.query.search;
    users = await userModel.find(
      {
        $or: [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      },
      { password: false }
    );
  } else {
    users = await userModel.find({}, { password: false });
  }

  res.status(200).json({
    status: statusText.SUCCESS,
    message: "users are here",
    code: 200,
    data: { users },
  });
});

const getUserById = catchError(async (req, res, next) => {
  const userId = req.params.id;

  const user = await userModel.findById(userId);
  if (!user) {
    const error = appError.create("user is not found", 404, statusText.FAIL);
    next(error);
    return;
  }

  res.status(200).json({
    status: statusText.SUCCESS,
    message: "This is the user",
    code: 200,
    data: { user },
  });
});

const updateUserById = catchError(async (req, res, next) => {
  const userId = req.params.id;

  const user = await userModel.findById(userId);
  if (!user) {
    const error = appError.create("user is not found", 404, statusText.FAIL);
    next(error);
    return;
  }

  const { firstName, lastName } = req.body || user;

  if (!req.body) {
    const error = appError.create("Body is empty", 400, statusText.ERROR);
    next(error);
    return;
  }

  if (!firstName && !lastName) {
    const error = appError.create(
      "You can edit firstName or lastName only",
      400,
      statusText.FAIL
    );
    next(error);
    return;
  }

  await userModel.findOneAndUpdate(
    { _id: userId },
    { $set: { firstName, lastName } }
  );

  res.status(200).json({
    status: statusText.SUCCESS,
    message: "updated user successfully",
    code: 200,
    data: null,
  });
});

const deleteUserById = catchError(async (req, res, next) => {
  const userId = req.params.id;

  const user = await userModel.findById(userId);
  if (!user) {
    const error = appError.create("user is not found", 404, statusText.FAIL);
    next(error);
    return;
  }

  await userModel.deleteOne({ _id: userId });

  res.status(200).json({
    status: statusText.SUCCESS,
    message: "deleted user successfully",
    code: 200,
    data: null,
  });
});

module.exports = {
  getUsers,
  getUserById,
  register,
  login,
  updateUserById,
  deleteUserById,
};
