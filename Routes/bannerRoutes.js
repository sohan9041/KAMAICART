import express from "express";
import multer from "multer";
import { createBanner, getBannerList, getBannerByType, deleteBanner,getBannerByTypeapp } from "../Controllers/bannerController.js";
import { cookiesVerifyUser } from "../Middleware/verifyAuthMiddleware.js";
const router = express.Router();

// Multer config for banner uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/banner");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Routes
router.post("/",cookiesVerifyUser, upload.single("image"), createBanner);
router.get("/",cookiesVerifyUser, getBannerList);
router.get("/app", (req, res) => getBannerByTypeapp({ ...req, params: { type: "app" } }, res));
router.delete("/:id",cookiesVerifyUser, deleteBanner);

export default router;
