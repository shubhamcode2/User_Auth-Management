import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/userModel.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // Update the refresh token in the database
        //check agar u dont do this then kya hota?
        //so i get it , yaha jroori hai ye baahar bhi kar sakte hai par turnat hi update kar diya refresh token yaha se main db me update kar diya , is wale user ke help se bhale hi iska use yaha kuchh na kre aur bahar jake alag se banaye hoye copy db doc ko dobara se update kare cookies me dalne ke liye par yaaha add kiya tabhi ye wahaa accesss hopaya cookie me jane ke liye.

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    }

    catch (error) {
        throw new ApiError(500, "Failed to generate tokens", error)

    }
    i

}

const registerUser = asyncHandler(async (req, res) => {

    const { userName, email, fullName, password } = req.body;

    if ([userName, email, fullName, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    };

    const existedUser = await User.findOne({
        $or: [{ userName }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, " user with email or username already exists ")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }


    if (!avatarLocalPath) {
        throw new ApiError(400, "avatarlocalpath file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(500, "Error uploading files to cloudinary")
    }

    console.log("====================================");

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        userName
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

})

const loginUser = asyncHandler(async (req, res) => {

    const { email, userName, password } = req.body;

    if ([email, userName].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    };

    const user = await User.findOne({
        $or: [{ email }, { userName }]
    })

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials")
    }


    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    // // Update the refresh token in the database
    // user.refreshToken = refreshToken;
    // await user.save({ validateBeforeSave: false });

    // console.log("refresh token", refreshToken);


    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    const options = { httpOnly: true, secure: true }

    // return res
    //     .cookie("accessToken", accessToken, options)
    //     .cookie("refreshToken", refreshToken, options)
    //     .json(
    //         new ApiResponse(200, loggedInUser, accessToken, refreshToken),
    //         "User logged in Successfully"
    //     )


    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged In Successfully"
            )
        )


})

const logoutUser = asyncHandler(async (req, res) => {

    User.findByIdAndUpdate(
        req.user._id,
        { $set: { refreshToken: undefined, } },
        { new: true }
    )


    const options = { httpOnly: true, secure: true }
    return res
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out Successfully"))

})

const refreshAccessToken = asyncHandler(async (req, res) => {

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(400, "incoming refresh token is required -- unauthorized req")
    }
    
    try {

        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        if (!decodedToken) {
            throw new ApiError(401, "decoded token is required -- unauthorized req")
        }

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        if (!user) {
            throw new ApiError(401, "user is required  invlaid refresh token -- unauthorized req")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "refresh token didnt match -- unauthorized req")
        }

        const options = { httpOnly: true, secure: true }
        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id);


        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken,
                        refreshToken: newRefreshToken
                    },
                    "Access token refreshed Successfully"
                )
            )
    } catch (error) {

        throw new ApiError(401, "refresh token k kuchh smasya h ho function controller me", error)

    }

})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
}