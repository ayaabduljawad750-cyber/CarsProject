import Review from"../models/review.js";
import User from"../models/user.js";
import Product from"../models/product.js";

createReview = async (req, res) => {
  try{
    const userId = req.userId;
    const {product, evaluation } = req.body;
   // Check User Exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
  //Check Product Exists
    const productExists = await Product.findById(product);
    if (!productExists) {
      return res.status(404).json({ message: "Product not found" });
    }
  //prevent multiple reviews by same user for same product
    const existingReview = await Review.findOne({ userId, product });
    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this product" });
    }

//Create Review
        const review = await Review.create({userId, product, evaluation});
        return res.status(201).json(review);
    }catch(err){
        res.status(500).json({message:"error when createdreview"});
    }
};
//Update Review
updateReview = async (req, res) => {
    try{
        const review = await Review.findByIdAndUpdate(
            req.params.id,
            {...req.body, lastUpdateAt: Date.now() },
            {new: true}
        );
        if (!review) return res.status(404).json({ message: "Review not found" });
        res.json(review);
    }catch (err){
        res.status(500).json({message:"error when updatedreview"});
    }
};
// Delete Review
deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.json({ message: "Review deleted" });

  } catch (err) {
    res.status(500).json({ message: "error when deletedreview" });
  }
};

// Get Review by ID
getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
    if (!review) return res.status(404).json({ message: "Not found" });

    res.json(review);

  } catch (err) {
    res.status(500).json( { message: "error when getreview" } );
  }
};

// Get Product Rating (average)
getProductRating = async (req, res) => {
  try {
    const productId = req.params.productId;

    // Check if Product exists
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    //  Get reviews
    const reviews = await Review.find({ product: productId });

    //  If no reviews, return 0 average
    if (reviews.length === 0) {
      return res.json({ productId, averageRating: 0, totalReviews: 0 });
    }
    // Calculate average
    const sum = reviews.reduce((acc, r) => acc + r.evaluation, 0);
    const avg = sum / reviews.length;

    res.json({
      productId,
      averageRating: avg,
      totalReviews: reviews.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default {
  getProductRating,
  getReviewById,
  deleteReview,
  updateReview,
  createReview
}