import express from "express";
import { placeOrder, getOrderHistory, getOrderDetails,cancelOrder,reorder } from "../Controllers/orderController.js";
import { cookiesVerifyUser } from "../Middleware/verifyAuthMiddleware.js";

const router = express.Router();

router.post("/place", cookiesVerifyUser, placeOrder);
router.get("/history", cookiesVerifyUser, getOrderHistory);
router.get("/:id", cookiesVerifyUser, getOrderDetails);
router.post("/cancel", cookiesVerifyUser, cancelOrder);
router.post("/reorder", cookiesVerifyUser, reorder);

export default router;
