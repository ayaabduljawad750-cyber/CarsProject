import express from"express";
const feedBackRouter = express.Router();

import controllerFeedbacks from"../controllers/feedback.js"

import auth from"../middleware/auth";
import { validateFeedback, checkOwnerUpdate, checkOwnerOrAdminDelete} from"../middleware/validateFeedback";

feedBackRouter.post("/", auth, validateFeedback, controllerFeedbacks.createFeedback);
feedBackRouter.put("/:id", auth, checkOwnerUpdate, controllerFeedbacks.updateFeedback);
feedBackRouter.delete("/:id", auth, checkOwnerOrAdminDelete, controllerFeedbacks.deleteFeedback);
feedBackRouter.get("/", controllerFeedbacks.getAllFeedback);
feedBackRouter.get("/:id", controllerFeedbacks.getFeedbackById);


export default feedBackRouter;
