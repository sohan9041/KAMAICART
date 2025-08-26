import express from "express";
import { AppSignup, AppSignin,AppLogout,AppProfile } from "../Controllers/authController.js";
import { verifyUser } from "../Middleware/verifyAuthMiddleware.js";

export const router = express.Router();

router.post("/signup", AppSignup);
router.post("/signin", AppSignin);
router.post("/logout", AppLogout);
router.get("/me",verifyUser, AppProfile);
export default router;