import express from "express";
import { Signup, Signin, VerifyOtp, sendResetPassOTP, verifyResetOTP, resetPassword, profile, Logout ,
    getSellers,getCustomers,updateProfile,RefreshToken
 } from "../Controllers/authController.js";
import { verifyUser,cookiesverifyUser } from "../Middleware/verifyAuthMiddleware.js";

export const router = express.Router();

router.post("/signup", Signup);
router.post("/signin", Signin);
router.post("/verify-otp", VerifyOtp);
router.post("/send-reset-otp", sendResetPassOTP);
router.post("/verify-reset-otp", verifyResetOTP);
router.post("/reset-password", resetPassword);
router.get("/profile",cookiesverifyUser, profile);
router.post("/logout",cookiesverifyUser, Logout);
router.post("/update-profile",cookiesverifyUser, updateProfile);


router.get("/sellers",cookiesverifyUser, getSellers);
router.get("/customers",cookiesverifyUser, getCustomers);
router.post("/refresh", RefreshToken);


// router.get("/me", Logininfo);
