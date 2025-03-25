import { User } from "../models/userModel.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

            console.log(token);

        if (!token) {
            throw new ApiError(401, "Unauthorized req ha e")
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")


        if (!user) {
            throw new ApiError(401, "invalid access token ha e")
        }

        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401, "auth middleware k kuchh smasya h ho kahal jaye t invalid access token", error)

    }
});

