import mongoose from"mongoose";

const reviewSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required"]
    },
    product:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Product",
        required: [true , "Product ID is required"]
    },
    evaluation:{
        type: Number,
        min:[1 ,"Minimum evaluation is 1"],
        max:[5 ,"Maximum evaluation is 5"],
        validate:{
            validator: Number.isInteger,
            message: "Evaluation must be an integer"
        },
        required: [true, "Evaluation is required"]
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    lastUpdateAt:{
        type: Date
    }
})


let reviewModel = mongoose.model("Review", reviewSchema);

export default reviewModel
