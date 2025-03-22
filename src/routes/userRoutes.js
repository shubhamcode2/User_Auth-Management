import { Router } from "express";
import { registerUser } from "../controllers/userController.js";
import { upload } from "../middlewares/multerMiddleware.js";

const router = Router()

router.route("/register").post(
    upload.fields(
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ),
    registerUser);
// router.post("/register", registerUser);//appriciate it

//we used multer packege here bacause this route is the first part of backend and the flow start from here user send all data first to route and then we handle it in controller to send files we have multer here and to send text data we have express and used post method

export default router;