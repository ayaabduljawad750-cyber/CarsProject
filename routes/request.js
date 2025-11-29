const express = require("express");
const { auth } = require("../middlewares/auth");
const { authorize } = require("../middlewares/authorization");
const userRoles = require("../utils/userRoles");
const {
  getRequests,
  createRequest,
  getRequestById,
  updateStatusRequestById,
  deleteRequestById,
  getMyRequests,
  getMyRequestById,
  updateMyRequestById,
  deleteMyRequestById,
} = require("../controllers/request");

let requestRoute = express.Router();

requestRoute.get("/", auth, authorize(userRoles.ADMIN), getRequests);

requestRoute.post("/", auth, authorize(userRoles.USER), createRequest);

requestRoute.get("/get", auth, getMyRequests);

requestRoute.get("/get/:id", auth, getMyRequestById);

requestRoute.put("/update/:id", auth, updateMyRequestById);

requestRoute.delete("/delete/:id", auth, deleteMyRequestById);

requestRoute.get("/:id", auth, authorize(userRoles.ADMIN), getRequestById);

requestRoute.put(
  "/:id",
  auth,
  authorize(userRoles.ADMIN),
  updateStatusRequestById
);

requestRoute.delete(
  "/:id",
  auth,
  authorize(userRoles.ADMIN),
  deleteRequestById
);

module.exports = requestRoute