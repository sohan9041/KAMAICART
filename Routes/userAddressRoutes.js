import express from "express";
import { AppGetAddress,AppGetAddressById, AppAddAddress, AppUpdateAddress, AppDeleteAddress } from "../Controllers/userAddressController.js";
import { verifyUser } from "../Middleware/verifyAuthMiddleware.js";

export const router = express.Router();

router.get("/address",verifyUser, AppGetAddress);
router.get("/address/:id", verifyUser, AppGetAddressById);
router.post("/address",verifyUser, AppAddAddress);
router.post("/address/:id",verifyUser, AppUpdateAddress);
router.delete("/address/:id",verifyUser, AppDeleteAddress);

export default router;