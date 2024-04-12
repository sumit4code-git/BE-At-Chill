import { Router } from "express";
import { changeUserPassword, logOutUser, loginUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name : "avatar",
            maxCount : 1
        },{
            name : "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
    )

 router.route("/login").post(loginUser)   
 router.route("/logout").post(verifyToken,logOutUser)
 router.route("/refresh-token").post(refreshAccessToken)
 router.route("/change-password").post(changeUserPassword)
export default  router 