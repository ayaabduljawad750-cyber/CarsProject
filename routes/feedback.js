const express = require("express");
const router = express.Router();

const {
    createFeedback,
    updateFeedback,
    deleteFeedback,
    getFeedback,
    getallFeedback
} = require("../controllers/feedback")

const auth = require("../middleware/auth");
const { validateFeedback, checkOwnerUpdate, checkOwnerOrAdminDelete } = require("../middleware/validateFeedback");

router.post("/", auth, validateFeedback, createFeedback);
router.put("/:id", auth, checkOwnerUpdate, updateFeedback);
router.delete("/:id", auth, checkOwnerOrAdminDelete, deleteFeedback);
router.get("/:id", getFeedback);
router.get("/", getAllFeedback);

module.exports = router;
