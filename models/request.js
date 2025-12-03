import mongoose from "mongoose"
import userRoles from "../utils/userRoles.js"

const requestSchema = mongoose.Schema({
  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
  },
  requestContent:{
    type:String,
    enum:[userRoles.SELLER,userRoles.MaintenanceCenter]
  },
  status:{
    type:String,
    enum:["Pending","Acceptable","Unacceptable"],
    default:"Pending"
  }
})

let requestModel = mongoose.model("Request",requestSchema)

export default requestModel