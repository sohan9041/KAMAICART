import express from "express";
import multer from "multer";
import { createOffer, getOfferList, deleteOffer,getOfferListForWeb } from "../Controllers/offerController.js";
import { cookiesVerifyUser } from "../Middleware/verifyAuthMiddleware.js";

const router = express.Router();

// Multer config for offer uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/offer");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Routes
router.post("/", cookiesVerifyUser, upload.single("image"), createOffer);
router.get("/", cookiesVerifyUser, getOfferList);
router.get("/web",  getOfferListForWeb);

router.delete("/:id", cookiesVerifyUser, deleteOffer);

export default router;
