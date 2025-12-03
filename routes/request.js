import express from "express";
import auth from "../middlewares/auth.js";
import authorize from "../middlewares/authorization.js";
import userRoles from "../utils/userRoles.js";
import requestControl from "../controllers/request.js";

let requestRoute = express.Router();

requestRoute.get("/", auth, authorize(userRoles.ADMIN), requestControl.getRequests);

requestRoute.post("/", auth, authorize(userRoles.USER), requestControl.createRequest);

requestRoute.get("/get", auth, requestControl.getMyRequests);

requestRoute.get("/get/:id", auth, requestControl.getMyRequestById);

requestRoute.put("/update/:id", auth, requestControl.updateMyRequestById);

requestRoute.delete("/delete/:id", auth, requestControl.deleteMyRequestById);

requestRoute.get("/:id", auth, authorize(userRoles.ADMIN), requestControl.getRequestById);

requestRoute.put(
  "/:id",
  auth,
  authorize(userRoles.ADMIN),
  requestControl.updateStatusRequestById
);

requestRoute.delete(
  "/:id",
  auth,
  authorize(userRoles.ADMIN),
  requestControl.deleteRequestById
);

export default requestRoute 