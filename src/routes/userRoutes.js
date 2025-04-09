import { Router } from "express";
import { changeCurrentUserPassword, getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage } from "../controllers/userController.js";
import { upload } from "../middlewares/multerMiddleware.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 },
    ]),
    registerUser);

router.route("/login").post(loginUser)
router.route("/refreshAccessToken").post(refreshAccessToken)

//secured routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/getCurrentUser").get(verifyJWT, getCurrentUser)
router.route("/changeCurrentUserPassword").patch(verifyJWT, changeCurrentUserPassword) //not givin params cause for current user only
router.route("/updateAccountDetails").put(verifyJWT, updateAccountDetails)
router.route("/updateUserAvatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/updateUserCoverImage").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)




// router.post("/register", registerUser);//appriciate it

//we used multer packege here bacause this route is the first part of backend and the flow start from here user send all data first to route and then we handle it in controller to send files we have multer here and to send text data we have express and used post method

export default router;