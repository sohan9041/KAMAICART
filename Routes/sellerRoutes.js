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
  updateProfile
} from "../Controllers/sellerController.js";
import { verifyUser, cookiesverifyUser } from "../Middleware/verifyAuthMiddleware.js";
import { uploadSellerDocs } from "../Middleware/imageUploadMiddleware.js";


const router = express.Router();

router.post("/",cookiesverifyUser, createSeller);
router.get("/",cookiesverifyUser, getSellerList);
router.get("/:id",cookiesverifyUser, getSellerById);
router.put("/:id",cookiesverifyUser, updateSeller);
router.patch("/:id/toggle-status",cookiesverifyUser, toggleSellerStatus);

router.delete("/:id",cookiesverifyUser, deleteSeller);

router.post("/registration",uploadSellerDocs, sellerRegistration);
router.post("/change-password",cookiesverifyUser, changePassword);
router.post("/update-profile",cookiesverifyUser, updateProfile);


export default router;
