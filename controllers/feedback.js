const Feedback = require("../models/feedback");
const User = require("../models/user");
const Product = require("../models/product");

exports.createFeedback = async (req, res) =>{
    try{
        const userId= req.userId;
        const { product, comment } = req.body;

        // Check User Exists
        const user = await User.findById(userId);
        if (!user){
            return res.status(404).json({ message: "User not found" });
        }
        // Check Product
        const productExists = await Product.findById(product);
            if (!productExists) {
              return res.status(404).json({ message: "Product not found" });
            }
//Create Feedback
const feedback = await Feedback.create({ userId, product, comment });
res.status(201).json(feedback);
    }catch(err){
        res.status(500).json({ message: "Error when creating feedback"});
    }

    //Update Feedback
    exports.updateFeedback = async (req, res) =>{
        try{
const feedback = await Feedback.findByIdAndUpdate(
    req.params.id,
    {...req.body,lastUpdateAt: Date.now() },
    {new:true}
);
if(!feedback) {
return res.status(404).json({ message: "Feedback not found"});
};
res.json(feedback);
        }catch(err){
            res.status(500).json({ message: "Error when updating feedback"});
        }
    };
    //Delete Feedback
    exports.deleteFeedback = async (req, res) =>{
        try{
            const feedback= await Feedback.findByIdAndDelete(req.params.id);
            if(!feedback){
                return res.status(404).json({ message:" Feedback not found" });
            }
            res.json({ message: "Feedback deleted" });
        }catch(err){
            res.status(500).json({message: "Error when deleting feedback"});
        }
    };
    // Get Feedback by ID
    exports.getFeedbackById= async (req, res) => {
        try{
            const feedback = await Feedback.findById(req.params.id);
            if(!feedback){
                return res.status(404).json({ message: "Feedback not found" });
            };
            res.json(feedback)
        }catch(err){
            res.status(500).json({message: "Error when getting feedback"});
        }
    };
    exports.getAllFeedback = async (req, res) => {
        try{
            const allFeedback = await Feedback.find();
            if(allFeedback === 0){
                return res.status(404).json({ message: "No feedback found" });
            }
            res.json(allFeedback);
        }catch(err){
            res.status(500).json({message: "Error when getting all feedback"});
        }
    }
}
    
