import express from "express";
import {
  createAdmin,
  getAdminList,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  login,
  logout
} from "../Controllers/adminController.js";
import { cookiesVerifyUser } from "../Middleware/verifyAuthMiddleware.js";


const router = express.Router();

router.post("/",cookiesVerifyUser, createAdmin);
router.get("/",cookiesVerifyUser, getAdminList);
router.get("/:id",cookiesVerifyUser, getAdminById);
router.put("/:id",cookiesVerifyUser, updateAdmin);
router.delete("/:id",cookiesVerifyUser, deleteAdmin);
router.post("/login", login);
router.post("/logout",cookiesVerifyUser, logout);


export default router;
