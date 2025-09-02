// Routes/productRoutes.js
import express from "express";
import {
  addProduct,
  getAllProducts,
  getProductById,
  updateProductById,
  deleteProductById,
} from "../Controllers/productController.js";
import { verifyUser,cookiesverifyUser } from "../Middleware/verifyAuthMiddleware.js";
import { uploadProductImages } from "../Middleware/imageUploadMiddleware.js";

const router = express.Router();

// Product Routes
router.post("/",uploadProductImages, cookiesverifyUser, addProduct);
router.get("/", cookiesverifyUser, getAllProducts);
router.get("/:id", cookiesverifyUser, getProductById);
router.put("/:id",uploadProductImages, cookiesverifyUser, updateProductById);
router.delete("/:id", cookiesverifyUser, deleteProductById);

export default router;
