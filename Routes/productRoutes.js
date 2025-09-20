// Routes/productRoutes.js
import express from "express";
import {
  addProduct,
  getAllProducts,
  getProductById,
  updateProductById,
  deleteProductById,
  getAppProductList,
  removeAttributeInProduct
} from "../Controllers/productController.js";

import {
  addToWishlist,
  getWishlist,
  removeFromWishlist
} from "../Controllers/wishlistController.js";

import { optionalAuth,verifyUser,cookiesverifyUser } from "../Middleware/verifyAuthMiddleware.js";
import { uploadProductImages } from "../Middleware/imageUploadMiddleware.js";

const router = express.Router();

router.post("/home-list",optionalAuth, getAppProductList); 


router.post("/wishlist", verifyUser, addToWishlist);
router.get("/wishlist", verifyUser, getWishlist);
router.delete("/wishlist/:id", verifyUser, removeFromWishlist);

// Product Routes
router.post("/removeAttributeInProduct", cookiesverifyUser, removeAttributeInProduct);

router.post("/",uploadProductImages, cookiesverifyUser, addProduct);
router.get("/", cookiesverifyUser, getAllProducts);

router.get("/:id", cookiesverifyUser, getProductById);
router.put("/:id",uploadProductImages, cookiesverifyUser, updateProductById);
router.delete("/:id", cookiesverifyUser, deleteProductById);



export default router;
