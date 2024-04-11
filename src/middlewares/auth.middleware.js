import { User } from "../models/user.models.js";
import { ApiError } from "../utils/APIError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

export const verifyToken = asyncHandler(async(req,_,next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer","")
        if(!token){
            throw new (ApiError(400,"Unauthorized request"))
        }
        const decodedToken = jwt.verify(token,process.env.ACESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        if(!user){
            throw new ApiError(401,"Invalid Access Token")
        }
        req.user = user;
        next()
    } catch (error) {
        throw new  ApiError(401,"Invalid Tokens")
    }
})