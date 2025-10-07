import express from "express";
import { placeOrder, getOrderHistory, getOrderDetails } from "../Controllers/orderController.js";
import { cookiesVerifyUser } from "../Middleware/verifyAuthMiddleware.js";

const router = express.Router();

router.post("/place", cookiesVerifyUser, placeOrder);
router.get("/history", cookiesVerifyUser, getOrderHistory);
router.get("/:id", cookiesVerifyUser, getOrderDetails);

export default router;
