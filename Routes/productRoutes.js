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
import { appbuyNowAddToCart, buyNowAddToCart } from "../Controllers/cartController.js";

const router = express.Router();

router.post("/home-list",optionalAuthHeader, getAppProductList);

router.get("/trending-product",optionalAuthCookie,getRandomProducts);
router.get("/top-rated",optionalAuthCookie,getTopRatedProducts);
router.post("/all-products",optionalAuthCookie, getWebAllProducts);
router.post("/similar-products",optionalAuthCookie, getSimilarProducts);
router.get("/details/:id", optionalAuthCookie, getProductDetails);

router.post("/wishlist", verifyUser, addToWishlist);
router.get("/wishlist", verifyUser, getWishlist);
router.delete("/wishlist/:id", verifyUser, removeFromWishlist);

router.post("/wishlistweb", cookiesVerifyUser, addToWishlistweb);
router.get("/wishlistweb", cookiesVerifyUser, getWishlistweb);
router.delete("/wishlistweb/:id", cookiesVerifyUser, removeFromWishlistweb);

router.post("/buyNowWeb", cookiesVerifyUser, buyNowAddToCart);

// Product Routes
router.post("/removeAttributeInProduct", cookiesVerifyUser, removeAttributeInProduct);

router.post("/",uploadProductImages, cookiesVerifyUser, addProduct);
router.get("/", cookiesVerifyUser, getAllProducts);

router.get("/:id", cookiesVerifyUser, getProductById);
router.put("/:id",uploadProductImages, cookiesVerifyUser, updateProductById);
router.delete("/:id", cookiesVerifyUser, deleteProductById);



export default router;
