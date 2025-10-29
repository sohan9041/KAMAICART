// ====== routes/roleRoutes.js ======
import express from "express";
import { Logout, profile, RefreshToken, Signin, Signup, updateProfile, webforgotPassword, webresetPassword, webupdatePassword, webverifyOtp
 } from "../Controllers/authController.js";
import { cookiesVerifyUser, optionalAuthCookie } from "../Middleware/verifyAuthMiddleware.js";
import { WebAddAddress, WebDeleteAddress, WebGetAddressById, WebGetAddresses, WebUpdateAddress } from "../Controllers/userAddressController.js";
import { getBannerByType } from "../Controllers/bannerController.js";
import { addToCart, buyNowAddToCart, getCart, removeFromCart, updateCartQuantity } from "../Controllers/cartController.js";
import { getMegaMenu } from "../Controllers/categoryController.js";
import { getOfferListForWeb } from "../Controllers/offerController.js";
import { cancelOrder, getOrderDetails, getOrderHistory, placeOrder, reorder } from "../Controllers/orderController.js";
import { getAllPaymentMethodsweb } from "../Controllers/paymentMethodController.js";
import { getProductDetails, getRandomProducts, getSimilarProducts, getTopRatedProducts, getWebAllProducts } from "../Controllers/productController.js";
import { getAllRolesforWeb } from "../Controllers/roleController.js";
import { getWhyChooseListForWeb } from "../Controllers/whyChooseController.js";
import { addToWishlistweb, getWishlistweb, removeFromWishlistweb } from "../Controllers/wishlistController.js";
import { getCancelReasonList } from "../Controllers/cancelReasonController.js";
import { getBrandList } from "../Controllers/brandController.js";
import { getPromoCodes } from "../Controllers/promoCodeController.js";

const router = express.Router();

router.post("/refresh", RefreshToken);
router.post("/signup", Signup);
router.post("/signin", Signin);

router.post("/forgot-password", webforgotPassword);
router.post("/verify-otp", webverifyOtp);
router.post("/reset-password", webresetPassword);
router.post("/update-password",cookiesVerifyUser, webupdatePassword);

router.get("/profile",cookiesVerifyUser, profile);
router.post("/logout",cookiesVerifyUser, Logout);
router.post("/update-profile",cookiesVerifyUser, updateProfile);

router.get("/address", cookiesVerifyUser, WebGetAddresses);
router.get("/address/:id", cookiesVerifyUser, WebGetAddressById);
router.post("/address", cookiesVerifyUser, WebAddAddress);
router.post("/address/:id", cookiesVerifyUser, WebUpdateAddress);
router.delete("/address/:id", cookiesVerifyUser, WebDeleteAddress);

router.get("/banner", (req, res) => getBannerByType({ ...req, params: { type: "web" } }, res));
router.get("/megaMenu", getMegaMenu);
router.get("/offer",  getOfferListForWeb);
router.post("/all-products",optionalAuthCookie, getWebAllProducts);
router.get("/details/:id", optionalAuthCookie, getProductDetails);
router.get("/trending-product",optionalAuthCookie,getRandomProducts);
router.get("/top-rated",optionalAuthCookie,getTopRatedProducts);
router.post("/similar-products",optionalAuthCookie, getSimilarProducts);

router.post("/cart", cookiesVerifyUser, addToCart);
router.get("/cart", cookiesVerifyUser, getCart);
router.delete("/cart/:id", cookiesVerifyUser, removeFromCart);
router.put("/cart/:id", cookiesVerifyUser, updateCartQuantity);
router.post("/buyNow", cookiesVerifyUser, buyNowAddToCart);


router.post("/orderplace", cookiesVerifyUser, placeOrder);
router.get("/orderhistory", cookiesVerifyUser, getOrderHistory);
router.get("/order/:id", cookiesVerifyUser, getOrderDetails);
router.post("/ordercancel", cookiesVerifyUser, cancelOrder);
router.post("/reorder", cookiesVerifyUser, reorder);

router.get("/paymentMethod",cookiesVerifyUser, getAllPaymentMethodsweb);

router.get("/roles", getAllRolesforWeb);
router.get("/whyChoose", getWhyChooseListForWeb);
router.get("/cancelReason", getCancelReasonList);
router.get("/brand", getBrandList);
router.get("/promoCodes", getPromoCodes);

router.post("/wishlist", cookiesVerifyUser, addToWishlistweb);
router.get("/wishlist", cookiesVerifyUser, getWishlistweb);
router.delete("/wishlist/:id", cookiesVerifyUser, removeFromWishlistweb);

export default router;