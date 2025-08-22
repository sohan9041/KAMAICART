import express from "express";
import { verifyUser } from "../Middleware/verifyAuthMiddleware.js";
import {
  addProductVariant,
  getProductVariants,
  getProductVariant,
  updateProductVariant,
  deleteProductVariant,
} from "../Controllers/productVariantController.js";

const router = express.Router();

router.post("/", verifyUser, addProductVariant);
router.get("/", verifyUser, getProductVariants);
router.get("/:id", verifyUser, getProductVariant);
router.put("/:id", verifyUser, updateProductVariant);
router.delete("/:id", verifyUser, deleteProductVariant);

export default router;
