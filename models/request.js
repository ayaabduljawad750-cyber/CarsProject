const mongoose = require("mongoose")
const userRoles = require("../utils/userRoles")

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

module.exports = requestModel