import { Router } from "express";
import { changeUserPassword, getUserChannelProfile, getWatchHistory, logOutUser, loginUser, refreshAccessToken, registerUser, updateUserAvatar, updateUserCoverImage } from "../controllers/user.controller.js";
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
 router.route("/change-password").post(verifyToken,changeUserPassword)
 router.route("/update-avatar").patch(verifyToken,upload.single("avatar"),updateUserAvatar)
 router.route("/update-coverimage").patch(verifyToken,upload.single("coverImage"),updateUserCoverImage)
 router.route("/channel/:username").get(verifyToken,getUserChannelProfile)
 router.route("/watch-history").get(verifyToken,getWatchHistory)
 
export default  router 