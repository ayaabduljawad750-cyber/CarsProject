import express from"express";
const reviewRouter = express.Router();

import controllerReview from"../controllers/review.js"

import auth from"../middlewares/auth.js";
import {checkOwnerOrAdminDelete,checkOwnerUpdate} from "../middlewares/validateFeedback.js"
import { validateReview } from "../middlewares/validateReview.js";


reviewRouter.post("/", auth,validateReview, controllerReview.createReview);
reviewRouter.put("/:id", auth, checkOwnerUpdate,controllerReview.updateReview);
reviewRouter.delete("/:id", auth, checkOwnerOrAdminDelete, controllerReview.deleteReview);
reviewRouter.get("/:id", controllerReview.getReviewById);
reviewRouter.get("/product/:productId/rating", controllerReview.getProductRating);

export default reviewRouter;
