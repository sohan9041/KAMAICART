import express from "express";
import {
  createCancelReason,
  updateCancelReason,
  getCancelReasonList,
  getCancelReasonById,
  deleteCancelReason,
} from "../Controllers/cancelReasonController.js";
import { cookiesVerifyUser } from "../Middleware/verifyAuthMiddleware.js";

const router = express.Router();

// -----------------------
// Public Routes
// -----------------------

// -----------------------
// Protected Routes
// -----------------------
router.use(cookiesVerifyUser); // all routes below require authentication

router.post("/", createCancelReason);
router.put("/:id", updateCancelReason);
router.get("/", getCancelReasonList);
router.get("/:id", getCancelReasonById);
router.delete("/:id", deleteCancelReason);

export default router;
