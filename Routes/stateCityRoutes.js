import express from "express";
import { getStates, getCitiesByState } from "../Controllers/stateCityController.js";
import { verifyUser } from "../Middleware/verifyAuthMiddleware.js";
import {
  appaddToCart,
  appgetCart,
  appremoveFromCart,
  appupdateCartQuantity
} from "../Controllers/cartController.js";
import { appplaceOrder, appgetOrderHistory, appgetOrderDetails,appcancelOrder,appreorder } from "../Controllers/orderController.js";

const router = express.Router();

router.get("/states", getStates);           // ✅ Get all states
router.get("/cities/:stateId", getCitiesByState);  // ✅ Get cities by state

router.post("/add-to-cart", verifyUser, appaddToCart);
router.get("/get-cart", verifyUser, appgetCart);
router.delete("/remove-from-cart/:id", verifyUser, appremoveFromCart);
router.put("/update-cart-quantity/:id", verifyUser, appupdateCartQuantity);

router.post("/place-order", verifyUser, appplaceOrder);
router.get("/order-history", verifyUser, appgetOrderHistory);
router.get("/order-details/:id", verifyUser, appgetOrderDetails);
router.post("/cancel-order", verifyUser, appcancelOrder);
router.post("/re-order", verifyUser, appreorder);

export default router;
