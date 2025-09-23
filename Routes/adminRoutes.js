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
import { cookiesverifyUser } from "../Middleware/verifyAuthMiddleware.js";


const router = express.Router();

router.post("/",cookiesverifyUser, createAdmin);
router.get("/",cookiesverifyUser, getAdminList);
router.get("/:id",cookiesverifyUser, getAdminById);
router.put("/:id",cookiesverifyUser, updateAdmin);
router.delete("/:id",cookiesverifyUser, deleteAdmin);
router.post("/login", login);
router.post("/logout",cookiesverifyUser, logout);


export default router;
