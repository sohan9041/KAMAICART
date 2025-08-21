import express from "express";
import { saveGeneralSetting, getGeneralSetting } from "../Controllers/generalSettingController.js";
import { verifyUser } from "../Middleware/verifyAuthMiddleware.js";
import { uploadSettingsImage } from "../Middleware/imageUploadMiddleware.js";
const router = express.Router();

// Save / Update settings
router.post("/save",verifyUser,  uploadSettingsImage.fields([
    { name: "logo", maxCount: 1 },
    { name: "favicon", maxCount: 1 },
  ]), saveGeneralSetting);

// Get settings
router.get("/", getGeneralSetting);

export default router;
