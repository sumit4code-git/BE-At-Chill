import mongoose, {isValidObjectId} from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/APIError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    const skip = (page * 10) - limit
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Video id is not valid");
    }
    const finalVideos =await  Comment.aggregate[(
        {
            $limit : limit
        },{
            $match : {
                video : new mongoose.Types.ObjectId(videoId)
            }
        },{
            $skip : skip
        }
    )]
    res.status(200).json(new ApiResponse(200,{videos : finalVideos}));

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }