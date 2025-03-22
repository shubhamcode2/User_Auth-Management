import { Router } from "express";
import { registerUser } from "../controllers/userController.js";


const router = Router()

router.route("/register").post(registerUser);
// router.post("/register", registerUser);//appriciate it

export default router;