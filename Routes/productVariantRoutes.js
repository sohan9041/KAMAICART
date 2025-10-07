import express from "express";
import { cookiesVerifyUser } from "../Middleware/verifyAuthMiddleware.js";
import {
  addProductVariant,
  getProductVariants,
  getProductVariant,
  updateProductVariant,
  deleteProductVariant,
} from "../Controllers/productVariantController.js";

const router = express.Router();

router.post("/", cookiesVerifyUser, addProductVariant);
router.get("/", cookiesVerifyUser, getProductVariants);
router.get("/:id", cookiesVerifyUser, getProductVariant);
router.put("/:id", cookiesVerifyUser, updateProductVariant);
router.delete("/:id", cookiesVerifyUser, deleteProductVariant);

export default router;
