import express from "express";
import {
  createSeller,
  getSellerList,
  getSellerById,
  updateSeller,
  deleteSeller,
  toggleSellerStatus
} from "../Controllers/sellerController.js";
import { verifyUser, cookiesverifyUser } from "../Middleware/verifyAuthMiddleware.js";


const router = express.Router();

router.post("/",cookiesverifyUser, createSeller);
router.get("/",cookiesverifyUser, getSellerList);
router.get("/:id",cookiesverifyUser, getSellerById);
router.put("/:id",cookiesverifyUser, updateSeller);
router.patch("/:id/toggle-status",cookiesverifyUser, toggleSellerStatus);

router.delete("/:id",cookiesverifyUser, deleteSeller);

export default router;
