// Routes/productRoutes.js
import express from "express";
import {
  addProduct,
  getProducts,
  getProduct,
  updateProductById,
  deleteProductById,
} from "../Controllers/productController.js";
import { verifyUser,cookiesverifyUser } from "../Middleware/verifyAuthMiddleware.js";

const router = express.Router();

// Product Routes
router.post("/", cookiesverifyUser, addProduct);
router.get("/", cookiesverifyUser, getProducts);
router.get("/:id", cookiesverifyUser, getProduct);
router.put("/:id", cookiesverifyUser, updateProductById);
router.delete("/:id", cookiesverifyUser, deleteProductById);

export default router;
