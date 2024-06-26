import { asyncHandler } from "../utils/asyncHandler.js";
import { upload } from "../middlewares/multer.middleware.js";
import { ApiError } from "../utils/APIError.js";
import { User } from "../models/user.models.js";
import { uploadOnCludinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { json } from "express";
import mongoose from "mongoose";

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;
  if (
    [fullName, email, username, password].some((field) => !field || field.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }
  const userFind = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (userFind) {
    throw new ApiError(409, "User Already Exist");
  }
  const avatarLocalPath = req.files?.avatar[0]?.path;
  let coverImageLocalPath;
  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }
  if (!avatarLocalPath) throw new ApiError(400, "Avatar Not Available");
  const avatar = await uploadOnCludinary(avatarLocalPath);
  const coverImage = await uploadOnCludinary(coverImageLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Avatar could not upload");
  }
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });
  const createdUser = await User.findById(user._id)?.select("-password -refreshToken");
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while creating user");
  }
  return res.status(200).json(
    new ApiResponse(200, createdUser, "User Registered Sucessfully"),
  );

});
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating referesh and access token");
  }
};

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  console.log(req.body);
  console.log(username);
  if (!username && !email) {
    throw new ApiError(400, "Username or email is required");
  }
  const user = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (!user) {
    throw new ApiError(400, "user does not exist!");
  }
  const isValid = await user.isPasswordCorrect(password);
  if (!isValid) {
    throw new ApiError(400, "Incorrect Password");
  }
  const { accessToken, refreshToken } = (await generateAccessAndRefreshToken(user._id));

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  const option = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(
      new ApiResponse(200,
        {
          user: loggedInUser, accessToken, refreshToken,
        },
        "Successfull login"),
    );

});

const logOutUser = asyncHandler(async (req, res) => {

  const userFound = await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,
    },
  );
  const option = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", option)
    .clearCookie("refreshToken", option)
    .json(
      new ApiResponse(200,
        {
          userId: userFound._id, userName: userFound.username,
        },
        "Successfull Logged Out"),
    );

});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const reqRefeshToken = req.cookie?.refreshToken || req.body.refreshToken;
  if (!reqRefeshToken) {
    throw new ApiError(401, "unauthorized access");
  }
  try {
    const decodedRefeshToken = jwt.verify(reqRefeshToken, process.env.REFRESH_TOKEN_SECRET); //If verification succeeds, decoded will contain the payload of the token
    const user = await User.findById(decodedRefeshToken._id);
    if (!user?.refreshToken) {
      throw new ApiError(400, "user not logged in");
    }
    if (!user) {
      throw new ApiError(401, "invalid refesh token");
    }
    if (reqRefeshToken !== user?.refreshToken) {
      throw new ApiError(401, "refresh token is expired or used");
    }
    const { accessToken, refreshToken } = (await generateAccessAndRefreshToken(user._id));

    const option = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(200)
      .cookie("accessToken", accessToken, option)
      .cookie("refreshToken", refreshToken, option)
      .json(
        new ApiResponse(200,
          {
            accessToken, refreshToken,
          },
          "Successfull refreshed"),
      );
  } catch (error) {
    throw new ApiError(400, "Error verifying refresh token");
  }


});

const changeUserPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "old or new passowrd not given");
  }
  const currentUser = req?.user;
  const isCorrectPassword = await currentUser.isCorrectPassword(oldPassword);
  if (!isCorrectPassword) {
    throw new ApiError(400, "Incorrect old password");
  }
  currentUser.password = newPassword;
  currentUser.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(
      new ApiResponse(200,
        "Successfully password changed"),
    );

});
const updateUserAvatar = asyncHandler(async (req, res) => {
  const userAvatar = req.file?.path;
  if (!userAvatar) {
    throw new ApiError(400, " Please add avatar image");
  }
  const avatarUrl = await uploadOnCludinary(userAvatar);
  if (!avatarUrl?.url) {
    throw new ApiError(400, "Error while uploading avatar");
  }
  const newUser = await User.findByIdAndUpdate(req.user?._id, {
    $set: {
      avatar: avatarUrl?.url,
    },
  }, {
    new: true,
  }).select("-password -refreshToken");
  return res
    .status(200)
    .json(
      new ApiResponse(200, {
          newUser,
        },
        "Successfully Avatar changed"),
    );

});
const updateUserCoverImage = asyncHandler(async (req, res) => {
  const userCoverImage = req.file?.path;
  if (!userCoverImage) {
    throw new ApiError(400, " Please add avatar image");
  }
  const coverUrl = await uploadOnCludinary(userCoverImage);
  if (!coverUrl?.url) {
    throw new ApiError(400, "Error while uploading avatar");
  }
  const newUser = await User.findByIdAndUpdate(req.user?._id, {
    $set: {
      avatar: coverUrl?.url,
    },
  }, {
    new: true,
  }).select("-password -refreshToken");
  return res
    .status(200)
    .json(
      new ApiResponse(200, {
          newUser,
        },
        "Successfully cover image changed"),
    );

});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username?.trim()) {
    throw new ApiError(400, "Username is empty");
  }
  const channel = await User.aggregate([
    {
      $match: {
        userName: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channels",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscribers",
        as: "subscriberedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channeSsubscriberedToCount: {
          $size: "$subscriberedTo",
        },
        isSubscribed: {
          $cond: {
            if : {$in: [req.user?._id, "$subscribers.subscriber"] },
          then: true,
          else: false,
        }
      }
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(400, "channel does not exists");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User channel fetched successfully"),
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    thumbnail: 1,
                    username: 1,
                  },
                },
                {
                  $addFields: {
                    owner: {
                      $first: "$owner",
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(200, user[0], "Watch history fetched successfully"),
    );
});

export {
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken,
  changeUserPassword,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
};