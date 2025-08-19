import express from "express";
import {
  Signup,
  Signin,
  profile,
  VerifyOtp,
  sentresetpassOTP,
  verifyResetOTP,
  resetPassword,
  // Logininfo,
  Logout,
} from "../Controllers/auth_Controller.js";
import { verifyUser } from "../MiddleWere/verify_auth_middleware.js";

export const router = express.Router();

router.post("/signup", Signup);
router.post("/signin", Signin);
router.post("/verify-otp", VerifyOtp);
router.get("/me", verifyUser, profile);

router.post("/send-otp", sentresetpassOTP);
router.post("/verify", verifyResetOTP);

router.post("/set-password", resetPassword);
router.get("/logout", Logout);

// router.get("/me", Logininfo);
