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

import {
  getAllSortOptions,
  getSortOptionById,
  deleteSortOption,
  addSortOption,
  editSortOption,
} from "../Controllers/sortOptionController.js";


const router = express.Router();

router.post("/sortOption",cookiesVerifyUser, addSortOption);
router.get("/sortOption",cookiesVerifyUser, getAllSortOptions);
router.get("/sortOption/:id",cookiesVerifyUser, getSortOptionById);
router.delete("/sortOption/:id",cookiesVerifyUser, deleteSortOption);
router.put("/sortOption/:id",cookiesVerifyUser, editSortOption);


router.post("/",cookiesVerifyUser, createAdmin);
router.get("/",cookiesVerifyUser, getAdminList);
router.get("/:id",cookiesVerifyUser, getAdminById);
router.put("/:id",cookiesVerifyUser, updateAdmin);
router.delete("/:id",cookiesVerifyUser, deleteAdmin);
router.post("/login", login);
router.post("/logout",cookiesVerifyUser, logout);


export default router;
