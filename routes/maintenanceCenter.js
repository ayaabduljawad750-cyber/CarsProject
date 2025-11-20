const express = require("express")
const { getCenters, addCenter, getCenterById, updateCenterById, deleteCenterById } = require("../controllers/maintenanceCenter")
const { auth } = require("../middlewares/auth")
const { authorize } = require("../middlewares/authorization")
const userRoles = require("../utils/userRoles")

let maintenanceCenterRoute = express.Router()

maintenanceCenterRoute.get("/",getCenters)
maintenanceCenterRoute.post("/",auth,authorize(userRoles.MaintenanceCenter),addCenter)
maintenanceCenterRoute.get("/:id",getCenterById)
maintenanceCenterRoute.put("/:id",auth,authorize(userRoles.MaintenanceCenter),updateCenterById)
maintenanceCenterRoute.delete("/:id",auth,authorize(userRoles.MaintenanceCenter),deleteCenterById)

module.exports = maintenanceCenterRoute