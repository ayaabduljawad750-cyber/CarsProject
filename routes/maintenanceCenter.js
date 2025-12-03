import express from "express"
import centerControl from "../controllers/maintenanceCenter.js"
import auth from "../middlewares/auth.js"
import  authorize from"../middlewares/authorization.js"
import userRoles from "../utils/userRoles.js"

let maintenanceCenterRoute = express.Router()

maintenanceCenterRoute.get("/",centerControl.getCenters)
maintenanceCenterRoute.post("/",auth,authorize(userRoles.MaintenanceCenter),centerControl.addCenter)
maintenanceCenterRoute.get("/:id",centerControl.getCenterById)
maintenanceCenterRoute.put("/:id",auth,authorize(userRoles.MaintenanceCenter),centerControl.updateCenterById)
maintenanceCenterRoute.delete("/:id",auth,authorize(userRoles.MaintenanceCenter),centerControl.deleteCenterById)

export default maintenanceCenterRoute;