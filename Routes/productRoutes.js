// Routes/productRoutes.js
import express from "express";
import {
  addProduct,
  getProducts,
  getProduct,
  updateProductById,
  deleteProductById,
} from "../Controllers/productController.js";
import { verifyUser } from "../Middleware/verifyAuthMiddleware.js";

const router = express.Router();

// Product Routes
router.post("/", verifyUser, addProduct);
router.get("/", verifyUser, getProducts);
router.get("/:id", verifyUser, getProduct);
router.put("/:id", verifyUser, updateProductById);
router.delete("/:id", verifyUser, deleteProductById);

export default router;
