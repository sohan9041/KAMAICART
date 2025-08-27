import express from "express";
import { Signup, Signin, VerifyOtp, sendResetPassOTP, verifyResetOTP, resetPassword, profile, Logout ,
    getSellers,getCustomers,updateProfile
 } from "../Controllers/authController.js";
import { verifyUser } from "../Middleware/verifyAuthMiddleware.js";

export const router = express.Router();

router.post("/signup", Signup);
router.post("/signin", Signin);
router.post("/verify-otp", VerifyOtp);
router.post("/send-reset-otp", sendResetPassOTP);
router.post("/verify-reset-otp", verifyResetOTP);
router.post("/reset-password", resetPassword);
router.get("/profile",verifyUser, profile);
router.post("/logout", Logout);
router.post("/update-profile",verifyUser, updateProfile);


router.get("/sellers",verifyUser, getSellers);
router.get("/customers",verifyUser, getCustomers);

// router.get("/me", Logininfo);
