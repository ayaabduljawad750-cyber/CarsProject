import express from "express"
import { register , login} from "../controllers/user.js"

let userRoute = express.Router()

userRoute.post("/register",register)

userRoute.post("/login",login)

export default userRoute