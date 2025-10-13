import express from "express";
import {
  addPaymentMethod,
  updatePaymentMethod,
  //deletePaymentMethod,
  getAllPaymentMethods,
  getPaymentMethodById,
  getAllPaymentMethodsapp,
  getAllPaymentMethodsweb
} from "../Controllers/paymentMethodController.js";
import { verifyUser,cookiesVerifyUser } from "../Middleware/verifyAuthMiddleware.js";
import { uploadIcon } from "../Middleware/imageUploadMiddleware.js";


const router = express.Router();

router.get("/type",verifyUser, getAllPaymentMethodsapp);
router.get("/web",cookiesVerifyUser, getAllPaymentMethodsweb);

router.post("/",cookiesVerifyUser,uploadIcon.single("image"), addPaymentMethod);
router.put("/:id",cookiesVerifyUser, updatePaymentMethod);
router.get("/",cookiesVerifyUser, getAllPaymentMethods);
router.get("/:id",cookiesVerifyUser, getPaymentMethodById);

// router.delete("/:id",cookiesVerifyUser, deletePaymentMethod);

export default router;
