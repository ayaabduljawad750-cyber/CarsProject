const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const catchError = require("../middlewares/catchError.js");
const userModel = require("../models/user.js");
const appError = require("../utils/appError.js");
const statusText = require("../utils/statusText.js");
const { isEmail, isName, isStrongPassword } = require("../utils/validate.js");
const transporterStore = require("../utils/transporterStore.js");

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

  isName(firstName);
  isName(lastName);
  isEmail(email);
  isStrongPassword(password);

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
      { password: false, token: false }
    );
  } else if (req.query.lastName) {
    search = req.query.lastName;
    users = await userModel.find(
      { lastName: { $regex: search, $options: "i" } },
      { password: false, token: false }
    );
  } else if (req.query.email) {
    search = req.query.email;
    users = await userModel.find(
      { email: { $regex: search, $options: "i" } },
      { password: false, token: false }
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
      { password: false, token: false }
    );
  } else {
    users = await userModel.find({}, { password: false, token: false });
  }

  res.status(200).json({
    status: statusText.SUCCESS,
    message: "users are here",
    code: 200,
    data: { users },
  });
});

const getUserById = catchError(async (req, res, next) => {
  const userId = req.params.id || req.user.id;

  const user = await userModel.findById(userId,{password:false,token:false});
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
  const userId = req.params.id || req.user.id;

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

const updatePasswordById = catchError(async (req, res, next) => {
  const userId = req.user.id;
  let { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    const error = appError.create(
      "oldPassword and newPassword are required",
      400,
      statusText.ERROR
    );
    next(error);
    return;
  }

  const user = await userModel.findById(userId);

  const matchedPassword = await bcrypt.compare(oldPassword, user.password);

  if (!matchedPassword) {
    const error = appError.create(
      "oldPassword is wrong",
      400,
      statusText.ERROR
    );
    next(error);
    return;
  }

  isStrongPassword(newPassword);

  const hashPassword = await bcrypt.hash(newPassword, 10);

  await userModel.updateOne(
    { _id: userId },
    { $set: { password: hashPassword } }
  );

  res.status(200).json({
    status: statusText.SUCCESS,
    message: "password update successfully",
    code: 200,
    data: null,
  });
});

const sendVerificationCode = catchError(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    const error = appError.create("email is required", 400, statusText.ERROR);
    next(error);
    return;
  }

  const user = await userModel.findOne({ email: email });

  if (!user) {
    const error = appError.create("user is not found", 404, statusText.FAIL);
    next(error);
    return;
  }

  const sendVerificationEmail = async (email, code) => {
    await transporterStore.sendMail({
      from: process.env.EmailStore,
      to: email,
      subject: "Verify your Email",
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; color: #333;">
        <h2 style="text-align: center;">Verify Your Email</h2>
        <p style="font-size: 16px; text-align: center;">
          Hi there,<br/>
          Use the code below to verify your email address:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 24px; font-weight: bold; color: #ee3e55; padding: 10px; border: 2px solid #ee3e55; border-radius: 5px;">
            ${code}
          </span>
        </div>
        <p style="font-size: 14px; text-align: center; color: #555;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
    });
  };

  const code = Math.floor(100000 + Math.random() * 900000);
  await sendVerificationEmail(email, code);

  await userModel.updateOne(
    { email: email },
    { $set: { verificationCode: code } }
  );

  res.status(200).json({
    status: statusText.SUCCESS,
    message: "Verification code sent",
    code: 200,
    data: null,
  });
});

const verifyVerificationCode = catchError(async (req, res, next) => {
  const { email, verificationCode } = req.body;

  if (!email || !verificationCode) {
    const error = appError.create(
      "verificationCode and email are required",
      400,
      statusText.ERROR
    );
    next(error);
    return;
  }

  const user = await userModel.findOne({ email: email });

  if (!user) {
    const error = appError.create("user is not found", 404, statusText.FAIL);
    next(error);
    return;
  }

  if (user.verificationCode != verificationCode) {
    const error = appError.create(
      "verificationCode is not correct",
      401,
      statusText.FAIL
    );
    next(error);
    return;
  }

  res.status(200).json({
    status: statusText.SUCCESS,
    message: "verification code verified",
    code: 200,
    data: null,
  });
});

const changePassword = catchError(async (req, res, next) => {
  const { email, verificationCode, newPassword } = req.body;

  if (!email || !verificationCode || !newPassword) {
    const error = appError.create(
      "verificationCode , email and newPassword are required",
      400,
      statusText.ERROR
    );
    next(error);
    return;
  }

  const user = await userModel.findOne({ email, verificationCode });

  if (!user) {
    const error = appError.create("user is not found", 404, statusText.FAIL);
    next(error);
    return;
  }

  isStrongPassword(newPassword);

  const hashPassword = await bcrypt.hash(newPassword, 10);

  await userModel.updateOne({ email }, { $set: { password: hashPassword ,verificationCode:""} });

  res
    .status(200)
    .json({
      status: statusText.SUCCESS,
      message: "password changed successfully",
      code: 200,
      data: null,
    });
});

const deleteUserById = catchError(async (req, res, next) => {
  const userId = req.params.id || req.user.id;

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
  updatePasswordById,
  sendVerificationCode,
  verifyVerificationCode,
  changePassword,
};
