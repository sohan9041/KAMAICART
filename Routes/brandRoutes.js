import express from "express";
import multer from "multer";
import {
  createBrand,
  updateBrand,
  getBrandList,
  getBrandById,
  deleteBrand,
} from "../Controllers/brandController.js";
import { verifyUser, cookiesverifyUser } from "../Middleware/verifyAuthMiddleware.js";

const router = express.Router();
// -----------------------
// Brand Routes
// -----------------------

// Create brand
router.post("/", cookiesverifyUser, createBrand);

// Update brand
router.put("/:id", cookiesverifyUser, updateBrand);

// Get all brands
router.get("/", cookiesverifyUser, getBrandList);

// Get brand by ID
router.get("/:id", cookiesverifyUser, getBrandById);

// Delete brand
router.delete("/:id", cookiesverifyUser, deleteBrand);

export default router;
