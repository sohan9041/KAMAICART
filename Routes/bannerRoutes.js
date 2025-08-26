import express from "express";
import multer from "multer";
import { createBanner, getBannerList, getBannerByType, deleteBanner,getBannerByTypeapp } from "../Controllers/bannerController.js";
import { verifyUser } from "../Middleware/verifyAuthMiddleware.js";
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
router.post("/",verifyUser, upload.single("image"), createBanner);
router.get("/",verifyUser, getBannerList);
router.get("/web", (req, res) => getBannerByType({ ...req, params: { type: "web" } }, res));
router.get("/app", (req, res) => getBannerByTypeapp({ ...req, params: { type: "app" } }, res));
router.delete("/:id",verifyUser, deleteBanner);

export default router;
