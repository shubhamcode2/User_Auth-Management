import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/userModel.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser = asyncHandler(async (req, res) => {

    // destructuring 
    const { userName, email, fullName, password } = req.body;
    console.log("req.body", req.body);
    //varifying the fields
    if ([userName, email, fullName, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    };

    // checking if the user already exists
    const existedUser = User.findOne({
        $or: [{ userName }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, " user with email or username already exists ")
    }
    // uploading the files
    const avatarLocalPath = req.file?.avatar[0]?.path
    // const avatarLocalPath = req.files?.avatar?.[0]?.path; //changes file to files beause of chatgpt says
    const coverImageLocalPath = req.file?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "avatar file is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        userName: userName.toLowerCase(),
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500, "user not created - internal server error something went wrong")
    }


    return res.status(201).json(new ApiResponse(201, createdUser, "user created successfully"))




})

export { registerUser }