import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log(`MongoDB connected successfully ✅`);
  } catch (err) {
    console.log(err.message);
  }
};

export default connectDB;
