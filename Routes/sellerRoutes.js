import express from "express";
import {
  createSeller,
  getSellerList,
  getSellerById,
  updateSeller,
  deleteSeller,
  toggleSellerStatus,
  sellerRegistration,
  changePassword,
  updateProfile,
  genratePassword
} from "../Controllers/sellerController.js";
import { cookiesVerifyUser } from "../Middleware/verifyAuthMiddleware.js";
import { uploadSellerDocs } from "../Middleware/imageUploadMiddleware.js";


const router = express.Router();

router.post("/",cookiesVerifyUser, createSeller);
router.get("/",cookiesVerifyUser, getSellerList);
router.get("/:id",cookiesVerifyUser, getSellerById);
router.put("/:id",cookiesVerifyUser, updateSeller);
router.patch("/:id/toggle-status",cookiesVerifyUser, toggleSellerStatus);

router.delete("/:id",cookiesVerifyUser, deleteSeller);

router.post("/registration",uploadSellerDocs, sellerRegistration);
router.post("/change-password",cookiesVerifyUser, changePassword);
router.post("/update-profile",cookiesVerifyUser, updateProfile);
router.post("/generate-password", genratePassword);


export default router;
