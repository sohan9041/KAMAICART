import express from "express";
import {
  createPromoCode,
  getAllPromoCodes,
  getPromoCodeById,
  updatePromoCode,
  deletePromoCode,
  getAppPromoCodes,
//   applyPromoCode,
} from "../Controllers/promoCodeController.js";
import { cookiesVerifyUser, verifyUser } from "../Middleware/verifyAuthMiddleware.js";
import { appCheckout } from "../Controllers/orderController.js";

const router = express.Router();

router.get("/app",verifyUser, getAppPromoCodes);
router.post("/appCheckout",verifyUser, appCheckout);

// Admin CRUD
router.post("/",cookiesVerifyUser, createPromoCode);
router.get("/",cookiesVerifyUser, getAllPromoCodes);
router.get("/:id",cookiesVerifyUser, getPromoCodeById);
router.put("/:id",cookiesVerifyUser, updatePromoCode);
router.delete("/:id",cookiesVerifyUser, deletePromoCode);




// User apply promo
// router.post("/apply", cookiesVerifyUser, applyPromoCode);

export default router;
