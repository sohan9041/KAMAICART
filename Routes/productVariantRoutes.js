import express from "express";
import { verifyUser,cookiesverifyUser } from "../Middleware/verifyAuthMiddleware.js";
import {
  addProductVariant,
  getProductVariants,
  getProductVariant,
  updateProductVariant,
  deleteProductVariant,
} from "../Controllers/productVariantController.js";

const router = express.Router();

router.post("/", cookiesverifyUser, addProductVariant);
router.get("/", cookiesverifyUser, getProductVariants);
router.get("/:id", cookiesverifyUser, getProductVariant);
router.put("/:id", cookiesverifyUser, updateProductVariant);
router.delete("/:id", cookiesverifyUser, deleteProductVariant);

export default router;
