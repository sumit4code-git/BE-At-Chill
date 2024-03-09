import { asyncHandler } from "../utils/asyncHandler.js"
import { upload } from "../middlewares/multer.middleware.js";
import { ApiError } from "../utils/APIError.js";
import { User } from "../models/user.models.js";
import { uploadOnCludinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async (req,res) =>{
    const {fullName, email, username, password } = req.body
    if (
        [fullName, email, username, password].some((field) => !field || field.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }
    const userFind = await  User.findOne({
        $or: [ {username},{email}]
    })
    if(userFind){
        throw new ApiError(409,"User Already Exist")
    }
    const avatarLocalPath = req.files?.avatar[0]?.path
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    if(!avatarLocalPath) throw new ApiError(400,"Avatar Not Available")
    const avatar = await uploadOnCludinary(avatarLocalPath)
    const coverImage = await uploadOnCludinary(coverImageLocalPath)
    if(!avatar) {
        throw new ApiError(400,"Avatar could not upload")
    }
    const user = await User.create({
        fullName,
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    const createdUser = await User.findById(user._id)?.select("-password -refreshToken")
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while creating user")
    }
    return res.status(200).json(
        new ApiResponse(200,createdUser,"User Registered Sucessfully")
    )

})
export { registerUser }