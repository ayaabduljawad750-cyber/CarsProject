require("dotenv").config();

const cors = require("cors");
const express = require("express");
const connectDB = require("./config/db.js");
const handelError = require("./middlewares/handelError.js");
const appError = require("./utils/appError.js");
const statusText = require("./utils/statusText.js");
const catchError = require("./middlewares/catchError.js");
const userRoute = require("./routes/user.js");

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use("/users", userRoute);

app.use(
  catchError(function (req, res, next) {
    const error = appError.create("api is not found", 404, statusText.FAIL);
    next(error);
  })
);

app.use(handelError);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
