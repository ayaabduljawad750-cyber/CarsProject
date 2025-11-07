import express from "express"
import { register , login,getUsers,getUserById,updateUserById,deleteUserById} from "../controllers/user.js"

let userRoute = express.Router()

userRoute.post("/register",register)

userRoute.post("/login",login)

userRoute.get("/",getUsers)

userRoute.get("/:id",getUserById)

userRoute.put("/:id",updateUserById)

userRoute.delete("/:id",deleteUserById)

export default userRoute