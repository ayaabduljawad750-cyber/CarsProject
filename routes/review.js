import express from"express";
const reviewRouter = express.Router();

import controllerReview from"../controllers/review.js"

import auth from"../middleware/auth.js";
import validateReview from"../middleware/validateReview.js";
import checkReview from"../middleware/checkReview.js";

reviewRouter.post("/", auth, validateReview, createReview);
reviewRouter.put("/:id", auth, checkOwnerUpdate,updateReview);
reviewRouter.delete("/:id", auth, checkOwnerOrAdminDelete, deleteReview);
reviewRouter.get("/:id", getReviewById);
reviewRouter.get("/product/:productId/rating", getProductRating);

export default reviewRouter;
