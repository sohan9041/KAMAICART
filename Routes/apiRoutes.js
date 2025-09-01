import express from "express";
import { AppSignup, AppSignin,AppLogout,AppProfile,uploadUserImage,AppUpdateProfile,
  forgotPassword,verifyOtp,AppresetPassword,AppupdatePassword
 } from "../Controllers/authController.js";
import { verifyUser } from "../Middleware/verifyAuthMiddleware.js";
import { uploadProfileImage } from "../Middleware/imageUploadMiddleware.js";
export const router = express.Router();

router.post("/signup", AppSignup);
router.post("/signin", AppSignin);
router.post("/logout",verifyUser, AppLogout);
router.get("/me",verifyUser, AppProfile);
router.post(
  "/profileimage",
  verifyUser,
  uploadProfileImage.single("profileImage"), // Add image upload
  uploadUserImage
);
router.post("/update-profile",verifyUser, AppUpdateProfile);

router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", AppresetPassword);
router.post("/update-password",verifyUser, AppupdatePassword);

export default router;