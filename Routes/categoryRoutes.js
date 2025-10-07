import express from "express";
import {
  createMainCategory,
  createSubCategory,
  getCategories,
  getSubCategories,
  getSubSubCategories,
  updateCategory,
  getCategoryById,
  deleteCategory,
  swipeCategories,
  getThreeLevelCategories,
  getMegaMenu
} from "../Controllers/categoryController.js";
import { cookiesVerifyUser } from "../Middleware/verifyAuthMiddleware.js";
import { uploadCategoryImage } from "../Middleware/imageUploadMiddleware.js";
const router = express.Router();

//api
router.get("/all",  getThreeLevelCategories);
router.get("/megaMenu", getMegaMenu);


// ✅ Create
router.post(
  "/main",
  cookiesVerifyUser,
  uploadCategoryImage.single("image"), // Add image upload
  createMainCategory
);
router.post(
  "/sub",
  cookiesVerifyUser,
  uploadCategoryImage.single("image"), // Add image upload
  createSubCategory
);
// ✅ Get

router.get("/", cookiesVerifyUser, getCategories); // ?parent_id=null OR ?parent_id=1
router.get("/sub", cookiesVerifyUser, getSubCategories);
router.get("/sub-sub", cookiesVerifyUser, getSubSubCategories);
router.get("/:id", cookiesVerifyUser, getCategoryById);

// ✅ Update
router.put(
  "/:id",
  cookiesVerifyUser,
  uploadCategoryImage.single("image"), // Allow updating image
  updateCategory
);
router.post("/swipe", cookiesVerifyUser, swipeCategories);

// ✅ Delete
router.delete("/:id", cookiesVerifyUser, deleteCategory);
export default router;
