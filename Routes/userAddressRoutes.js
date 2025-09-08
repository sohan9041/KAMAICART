import express from "express";
import { AppGetAddress,AppGetAddressById, AppAddAddress, AppUpdateAddress, AppDeleteAddress } from "../Controllers/userAddressController.js";
import { verifyUser,cookiesverifyUser } from "../Middleware/verifyAuthMiddleware.js";
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

// ✅ Create User
router.post("/",cookiesverifyUser, createUser);

// ✅ Get All Users (with pagination)
router.get("/",cookiesverifyUser, getUserList);

// ✅ Get User by ID
router.get("/:id",cookiesverifyUser, getUserById);

// ✅ Update User
router.put("/:id",cookiesverifyUser, updateUser);

// ✅ Soft Delete User
router.delete("/:id",cookiesverifyUser, deleteUser);

// ✅ Toggle User Status (active/inactive)
router.patch("/:id/toggle-status",cookiesverifyUser, toggleUserStatus);



export default router;