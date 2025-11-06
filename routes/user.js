import express from "express"
import { register , login,getAllUsers,getUserById,updateUserById} from "../controllers/user.js"

let userRoute = express.Router()

userRoute.get("/",getAllUsers)

userRoute.get("/:id",getUserById)

userRoute.put("/:id",updateUserById)

userRoute.post("/register",register)

userRoute.post("/login",login)

export default userRoute