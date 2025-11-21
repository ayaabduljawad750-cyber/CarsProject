const express = require("express");
const router = express.Router();

const {
    createReview,
    updateReview,
    deleteReview,
    getReviewById,
    getProductRating
} = require("../controllers/review")

const auth = require("../middleware/auth");
const validateReview = require("../middleware/validateReview");
const checkReview = require("../middleware/checkReview");

router.post("/", auth, validateReview, createReview);
router.put("/:id", auth, checkOwnerUpdate,updateReview);
router.delete("/:id", auth, checkOwnerOrAdminDelete, deleteReview);
router.get("/:id", getReviewById);
router.get("/product/:productId/rating", getProductRating);

module.exports = router;
