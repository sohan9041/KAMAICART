import {
  CreateMainCategory,
  FetchInfoCategories,
  CreateSubCategory,
  FetchInfoSubCategories,
  FetchInfoSubSubCategories,
  UpdateCategory,
  DeleteCategory,
} from "../Services/categoryServices.js";

export const AddMainCategory = async (req, res) => {
  try {
    const category = await CreateMainCategory(req.body);
    res.status(201).json({ message: "Category created", category });
  } catch (error) {
    console.error("Add category error:", error.message);
    res.status(400).json({ message: error.message });
  }
};

export const AddSubCategory = async (req, res) => {
  try {
    const { name, parent_id } = req.body;

    const category = await CreateSubCategory({ name, parent_id });

    res.status(201).json({ message: "Category created", category });
  } catch (error) {
    console.error("Add category error:", error.message);
    res.status(400).json({ message: error.message });
  }
};

export const getChildrenCategoriesData = async (req, res) => {
  const { parentId } = req.params;
  try {
    const categories = await FetchInfoCategories(parentId);
    res.status(200).json({ categories: categories });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const SubCategoriesInfo = async (req, res) => {
  try {
    const categories = await FetchInfoSubCategories();
    res.status(200).json({ Subcategories: categories });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const SubSubCategoriesInfo = async (req, res) => {
  try {
    const categories = await FetchInfoSubSubCategories();
    res.status(200).json({ Subsubcategory: categories });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const UpdataCategoriesData = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const categories = await UpdateCategory({ name, id });
    res.status(200).json({ message: "Category updated", category: categories });
  } catch (error) {
    res.status(500).json({ message: "Something Went Wrong Plz Try Again" });
  }
};

export const DeleteCategoriesData = async (req, res) => {
  const { id } = req.params;

  try {
    const categories = await DeleteCategory(id);
    res.status(200).json({ message: "Category deleted", category: categories });
  } catch (error) {
    res.status(500).json({ message: "Something Went Wrong Plz Try Again" });
  }
};
