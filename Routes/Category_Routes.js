import express from "express";
import {
  AddMainCategory,
  AddSubCategory,
  DeleteCategoriesData,
  getChildrenCategoriesData,
  SubCategoriesInfo,
  SubSubCategoriesInfo,
  UpdataCategoriesData,
} from "../Controllers/CatagoryController.js";

export const Admin_router = express.Router();

Admin_router.post("/Maincategories", AddMainCategory);
Admin_router.post("/Subcategories", AddSubCategory);

Admin_router.get("/categories/children/:parentId", getChildrenCategoriesData);
Admin_router.get("/categories/subcategory/", SubCategoriesInfo);
Admin_router.get("/categories/subsubcategory", SubSubCategoriesInfo);

Admin_router.put("/categories/updatecategory/:id", UpdataCategoriesData);

Admin_router.delete("/categories/deletecategory/:id", DeleteCategoriesData);
