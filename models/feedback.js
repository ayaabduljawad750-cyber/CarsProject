import mongoose from"mongoose";
 const feedbackSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:[true,"User ID is required"]
    },
    product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product",
        required:[true, "Product ID is required"]
    },
    comment:{
        type: String,
        maxlength:[150, "Comment cannot exceed 150 characters"],
        trim: true,
        required:[true, "Feedback is required"]
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    lastUpdateAt:{
        type: Date
    }
    })

  let feedbackModel = mongoose.model("Feedback", feedbackSchema);

  export default feedbackModel
