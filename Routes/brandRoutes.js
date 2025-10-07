import express from "express";
import multer from "multer";
import {
  createBrand,
  updateBrand,
  getBrandList,
  getBrandById,
  deleteBrand,
} from "../Controllers/brandController.js";
import { cookiesVerifyUser } from "../Middleware/verifyAuthMiddleware.js";

const router = express.Router();
// -----------------------
// Brand Routes
// -----------------------
router.get("/web", getBrandList);

// Create brand
router.post("/", cookiesVerifyUser, createBrand);

// Update brand
router.put("/:id", cookiesVerifyUser, updateBrand);

// Get all brands
router.get("/", cookiesVerifyUser, getBrandList);

// Get brand by ID
router.get("/:id", cookiesVerifyUser, getBrandById);

// Delete brand
router.delete("/:id", cookiesVerifyUser, deleteBrand);


export default router;
