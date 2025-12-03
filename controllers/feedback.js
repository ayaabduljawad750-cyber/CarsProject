import Feedback from "../models/feedback.js";
import User from "../models/user.js";
import Product from "../models/product.js";

createFeedback = async (req, res) => {
  try {
    const userId = req.userId;
    const { product, comment } = req.body;

    // Check User Exists
    const user = await User.findById(userId);
    if (!user) {
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
  } catch (err) {
    res.status(500).json({ message: "Error when creating feedback" });
  }
};
// Get Feedback by ID
getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: "Error when getting feedback" });
  }
};

//Update Feedback
updateFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastUpdateAt: Date.now() },
      { new: true }
    );
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: "Error when updating feedback" });
  }
};

//Delete Feedback
deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: " Feedback not found" });
    }
    res.json({ message: "Feedback deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error when deleting feedback" });
  }
};

getAllFeedback = async (req, res) => {
  try {
    const allFeedback = await Feedback.find();
    if (allFeedback === 0) {
      return res.status(404).json({ message: "No feedback found" });
    }
    res.json(allFeedback);
  } catch (err) {
    res.status(500).json({ message: "Error when getting all feedback" });
  }
};

export default {
  createFeedback,
  getAllFeedback,
  updateFeedback,
  deleteFeedback,
  getFeedbackById,
};
