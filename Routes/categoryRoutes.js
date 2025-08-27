import express from "express";
import {
  createMainCategory,
  createSubCategory,
  getCategories,
  getSubCategories,
  getSubSubCategories,
  updateCategory,
  deleteCategory,
  swipeCategories,
  getThreeLevelCategories
} from "../Controllers/catagoryController.js";
import { verifyUser } from "../Middleware/verifyAuthMiddleware.js";
import { uploadCategoryImage } from "../Middleware/imageUploadMiddleware.js";
const router = express.Router();
// ✅ Create
router.post(
  "/main",
  verifyUser,
  uploadCategoryImage.single("image"), // Add image upload
  createMainCategory
);
router.post(
  "/sub",
  verifyUser,
  uploadCategoryImage.single("image"), // Add image upload
  createSubCategory
);
// ✅ Get
router.get("/", verifyUser, getCategories); // ?parent_id=null OR ?parent_id=1
router.get("/sub", verifyUser, getSubCategories);
router.get("/sub-sub", verifyUser, getSubSubCategories);
// ✅ Update
router.put(
  "/:id",
  verifyUser,
  uploadCategoryImage.single("image"), // Allow updating image
  updateCategory
);
router.post("/swipe", verifyUser, swipeCategories);
router.get("/all",  getThreeLevelCategories);
// ✅ Delete
router.delete("/:id", verifyUser, deleteCategory);
export default router;
