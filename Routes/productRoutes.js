// Routes/productRoutes.js
import express from "express";
import {
  addProduct,
  getAllProducts,
  getProductById,
  updateProductById,
  deleteProductById,
  getAppProductList,
  removeAttributeInProduct,
  getAppProductFilter,
  getRandomProducts,
  getTopRatedProducts,
  getWebAllProducts,
  getSimilarProducts,
  getProductDetails
} from "../Controllers/productController.js";

import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  addToWishlistweb,
  getWishlistweb,
  removeFromWishlistweb
} from "../Controllers/wishlistController.js";


import { optionalAuthHeader,verifyUser,cookiesVerifyUser,optionalAuthCookie } from "../Middleware/verifyAuthMiddleware.js";
import { uploadProductImages } from "../Middleware/imageUploadMiddleware.js";
import { appbuyNowAddToCart, buyNowAddToCart, getSortOptions } from "../Controllers/cartController.js";

const router = express.Router();

router.post("/home-list",optionalAuthHeader, getAppProductList);
router.post("/filter",getAppProductFilter);
router.get("/sort-option", getSortOptions);


router.post("/wishlist", verifyUser, addToWishlist);
router.get("/wishlist", verifyUser, getWishlist);
router.delete("/wishlist/:id", verifyUser, removeFromWishlist);

// Product Routes
router.post("/removeAttributeInProduct", cookiesVerifyUser, removeAttributeInProduct);

router.post("/",uploadProductImages, cookiesVerifyUser, addProduct);
router.get("/", cookiesVerifyUser, getAllProducts);

router.get("/:id", cookiesVerifyUser, getProductById);
router.put("/:id",uploadProductImages, cookiesVerifyUser, updateProductById);
router.delete("/:id", cookiesVerifyUser, deleteProductById);



export default router;
