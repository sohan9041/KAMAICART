import express from "express";
import {
  addToCart,
  getCart,
  removeFromCart,
  updateCartQuantity
} from "../Controllers/cartController.js";
import { verifyUser,cookiesVerifyUser } from "../Middleware/verifyAuthMiddleware.js";

const router = express.Router();

// ✅ Protected routes
router.post("/add", cookiesVerifyUser, addToCart);
router.get("/", cookiesVerifyUser, getCart);
router.delete("/:id", cookiesVerifyUser, removeFromCart);
router.put("/:id", cookiesVerifyUser, updateCartQuantity);


export default router;
