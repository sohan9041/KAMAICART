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
  getThreeLevelCategories
} from "../Controllers/categoryController.js";
import { verifyUser,cookiesverifyUser } from "../Middleware/verifyAuthMiddleware.js";
import { uploadCategoryImage } from "../Middleware/imageUploadMiddleware.js";
const router = express.Router();

//api
router.get("/all",  getThreeLevelCategories);

// ✅ Create
router.post(
  "/main",
  cookiesverifyUser,
  uploadCategoryImage.single("image"), // Add image upload
  createMainCategory
);
router.post(
  "/sub",
  cookiesverifyUser,
  uploadCategoryImage.single("image"), // Add image upload
  createSubCategory
);
// ✅ Get
router.get("/", cookiesverifyUser, getCategories); // ?parent_id=null OR ?parent_id=1
router.get("/sub", cookiesverifyUser, getSubCategories);
router.get("/sub-sub", cookiesverifyUser, getSubSubCategories);
router.get("/:id", cookiesverifyUser, getCategoryById);
// ✅ Update
router.put(
  "/:id",
  cookiesverifyUser,
  uploadCategoryImage.single("image"), // Allow updating image
  updateCategory
);
router.post("/swipe", cookiesverifyUser, swipeCategories);

// ✅ Delete
router.delete("/:id", cookiesverifyUser, deleteCategory);
export default router;
