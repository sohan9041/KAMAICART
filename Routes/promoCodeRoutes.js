import express from "express";
import {
  createPromoCode,
  getAllPromoCodes,
  getPromoCodeById,
  updatePromoCode,
  deletePromoCode,
//   applyPromoCode,
} from "../Controllers/promoCodeController.js";
import { cookiesVerifyUser } from "../Middleware/verifyAuthMiddleware.js";

const router = express.Router();

// Admin CRUD
router.post("/",cookiesVerifyUser, createPromoCode);
router.get("/",cookiesVerifyUser, getAllPromoCodes);
router.get("/:id",cookiesVerifyUser, getPromoCodeById);
router.put("/:id",cookiesVerifyUser, updatePromoCode);
router.delete("/:id",cookiesVerifyUser, deletePromoCode);

// User apply promo
// router.post("/apply", cookiesVerifyUser, applyPromoCode);

export default router;
