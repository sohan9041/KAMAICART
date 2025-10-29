import express from "express";
import { 
  AppGetAddress,
  AppGetAddressById, 
  AppAddAddress, 
  AppUpdateAddress, 
  AppDeleteAddress,
  WebGetAddresses,
  WebAddAddress,
  WebUpdateAddress,
  WebDeleteAddress,
  WebGetAddressById
 } from "../Controllers/userAddressController.js";
import { verifyUser,cookiesVerifyUser } from "../Middleware/verifyAuthMiddleware.js";
import {
  createUser,
  getUserList,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserStatus
} from "../Controllers/userController.js";

export const router = express.Router();

router.get("/address",verifyUser, AppGetAddress);
router.get("/address/:id", verifyUser, AppGetAddressById);
router.post("/address",verifyUser, AppAddAddress);
router.post("/address/:id",verifyUser, AppUpdateAddress);
router.delete("/address/:id",verifyUser, AppDeleteAddress);



router.post("/",cookiesVerifyUser, createUser);
router.get("/",cookiesVerifyUser, getUserList);
router.get("/:id",cookiesVerifyUser, getUserById);
router.put("/:id",cookiesVerifyUser, updateUser);
router.delete("/:id",cookiesVerifyUser, deleteUser);
router.patch("/:id/toggle-status",cookiesVerifyUser, toggleUserStatus);

export default router;