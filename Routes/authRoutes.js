import express from "express";
import { Signup, Signin, VerifyOtp, sendResetPassOTP, verifyResetOTP, 
    resetPassword, profile, Logout ,
    getSellers,getCustomers,updateProfile,RefreshToken,
    webforgotPassword,webverifyOtp,webresetPassword,webupdatePassword
 } from "../Controllers/authController.js";
import { cookiesVerifyUser } from "../Middleware/verifyAuthMiddleware.js";

export const router = express.Router();

router.post("/signup", Signup);
router.post("/signin", Signin);
//router.post("/verify-otp", VerifyOtp);
router.post("/send-reset-otp", sendResetPassOTP);
router.post("/verify-reset-otp", verifyResetOTP);
//router.post("/reset-password", resetPassword);
router.get("/profile",cookiesVerifyUser, profile);
router.post("/logout",cookiesVerifyUser, Logout);
router.post("/update-profile",cookiesVerifyUser, updateProfile);


router.get("/sellers",cookiesVerifyUser, getSellers);
router.get("/customers",cookiesVerifyUser, getCustomers);
router.post("/refresh", RefreshToken);

router.post("/forgot-password", webforgotPassword);
router.post("/verify-otp", webverifyOtp);
router.post("/reset-password", webresetPassword);
router.post("/update-password",cookiesVerifyUser, webupdatePassword);


// router.get("/me", Logininfo);
