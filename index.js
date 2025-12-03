import dotenv from "dotenv";
dotenv.config();
import cors from 'cors';
import express from 'express'
import connectDB from './config/db.js';
import handelError from './middlewares/handelError.js';
import appError from './utils/appError.js';
import statusText from './utils/statusText.js';
import catchError from './middlewares/catchError.js';
import userRoute from './routes/user.js';
import orderRoute from './routes/order.js';
import productRoute from './routes/products.js'
import requestRoute from "./routes/request.js";
import maintenanceCenterRoute from "./routes/maintenanceCenter.js";
import feedbackRoute from "./routes/feedback.js"
import reviewRoute from "./routes/review.js"
import bookingRoute from "./routes/bookingMaintenance.js"

const app = express(); 
connectDB();

app.use(cors());
app.use(express.json());

app.use("/users",userRoute)
app.use("/orders",orderRoute)
app.use("/products",productRoute)
app.use("/review",reviewRoute)
app.use("/feedback",feedbackRoute)
app.use("/booking",bookingRoute)

app.use(catchError(function(req,res,next){
  const error = appError.create("api is not found",404,statusText.FAIL)
  next(error)
}))

app.use("/requests",requestRoute)

app.use("/centers",maintenanceCenterRoute)

app.use(
  catchError(function (req, res, next) {
    const error = appError.create("api is not found", 404, statusText.FAIL);
    next(error);
  })
);

app.use(handelError);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
 