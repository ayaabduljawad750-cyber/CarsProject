const Feedback = require("../models/feedback");
const User = require("../models/user");
const Product = require("../models/product");

const validateFeedback = (req, res, next) => {
    const { product, comment } = req.body;
    if (!product) {
        return res.status(400).json({ message: "Product ID is required" })
    }
    if (!comment || comment.trim() === "") {
        return res.status(400).json({ message: "Comment is required" });
    }
    next();
};

// Owner can update
const checkOwnerUpdate = async (req, res, next) => {
    const fb = await Feedback.findById(req.params.id);
    if (!fb) {
        return res.status(404).json({ message: "Feedback not found" });
    }
    if (fb.userId.toString() !== req.userId) {
        return res.status(404).json({ message: "Not authorized to update" });
    }
    next();
};

// Owner or admin can delete
const checkOwnerOrAdminDelete = async (req, res, next) => {
    const fb = await Feedback.findById(req.params.id);
    if (!fb) {
        return res.status(404).json({ message: "Feedback not found" });
    }
    if (fb.userId.toString() !== req.userId && req.userRole !== "admin") {
        return res.status(403).json({ message: "Not authorized to delete" });
    }
    next();
};
module.exports = {
    validateFeedback,
    checkOwnerUpdate,
    checkOwnerOrAdminDelete
}
