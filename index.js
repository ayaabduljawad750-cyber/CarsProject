import dotenv from 'dotenv';
dotenv.config();

import cors from 'cors';
import express from 'express'
import connectDB from './config/db.js';
import handelError from './middlewares/handelError.js';
import appError from './utils/appError.js';
import statusText from './utils/statusText.js';
import catchError from './middlewares/catchError.js';

const app = express();
connectDB();

app.use(cors());
app.use(express.json());



app.use(catchError(function(req,res,next){
  const error = appError.create("api is not found",404,statusText.FAIL)
  next(error)
}))


app.use(handelError);

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`));