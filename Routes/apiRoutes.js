import express from "express";
import { AppSignup, AppSignin,AppLogout,AppProfile,uploadUserImage,AppUpdateProfile } from "../Controllers/authController.js";
import { verifyUser } from "../Middleware/verifyAuthMiddleware.js";
import { uploadProfileImage } from "../Middleware/imageUploadMiddleware.js";
export const router = express.Router();

router.post("/signup", AppSignup);
router.post("/signin", AppSignin);
router.post("/logout", AppLogout);
router.get("/me",verifyUser, AppProfile);
router.post(
  "/profileimage",
  verifyUser,
  uploadProfileImage.single("profileImage"), // Add image upload
  uploadUserImage
);
router.post("/update-profile",verifyUser, AppUpdateProfile);

export default router;