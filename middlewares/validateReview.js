import Review from"../models/review.js";
const validateReview = (req, res, next) => {
  const { product, evaluation } = req.body;
  if (!product) {
    return res.status(400).json({ message: "Product ID is required" });
  }
  if (evaluation == undefined) {
    return res.status(400).json({ message: "Evaluation is required" });
  }
  next();
};

// Owner can update
const checkOwnerUpdate = async (req,res,next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({message:"Review not found"});
  if (review.userId.toString() !== req.userId) return res.status(403).json({message:"Not authorized to update"});
  next();
};

// Owner or admin can delete
const checkOwnerOrAdminDelete = async (req,res,next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({message:"Review not found"});
  if (review.userId.toString() !== req.userId && req.userRole !== "admin")
    return res.status(403).json({message:"Not authorized to delete"});
  next();
};
export {
  validateReview,
  checkOwnerUpdate,
  checkOwnerOrAdminDelete
};
