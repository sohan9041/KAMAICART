import {
  InsertMainCategory,
  InsertSubCategory,
  GetInfoFromCategoriesData,
  GetInfoOnlySubCategory,
  GetInfoOnlySubSubCategory,
  UpdateCategoryByID,
  DeleteCategoryByID,
} from "../Models/cateogryModel.js"; // adjust path if needed
import apiResponse from "../Helper/apiResponse.js";

// ✅ Create Main Category with Image
export const createMainCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const image = req.file ? `/uploads/category/${req.file.filename}` : null; // Get uploaded image filename

    const record = await InsertMainCategory({ name, image });
    return apiResponse.successResponseWithData(res, "Main Category created", record);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// ✅ Create Sub Category with Image
export const createSubCategory = async (req, res) => {
  try {
    const { name, parent_id } = req.body;
    const image = req.file ? `/uploads/category/${req.file.filename}` : null; // Get uploaded image filename

    const record = await InsertSubCategory({ name, parent_id, image });
    return apiResponse.successResponseWithData(res, "Sub Category created", record);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};


// ✅ Get All (by parent_id)
export const getCategories = async (req, res) => {
  try {
    const parent_id = req.query.parent_id || "null";
    const records = await GetInfoFromCategoriesData(parent_id);
    return apiResponse.successResponseWithData(res, "Fetched successfully", records);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// ✅ Get Only Sub Categories
export const getSubCategories = async (req, res) => {
  try {
    const records = await GetInfoOnlySubCategory();
    return apiResponse.successResponseWithData(res, "Fetched successfully", records);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// ✅ Get Only Sub-Sub Categories
export const getSubSubCategories = async (req, res) => {
  try {
    const records = await GetInfoOnlySubSubCategory();
    return apiResponse.successResponseWithData(res, "Fetched successfully", records);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// ✅ Update Category
export const updateCategory = async (req, res) => {
  try {
    const { id, name } = req.body;
    const record = await UpdateCategoryByID({ id, name });
    return apiResponse.successResponseWithData(res, "Updated successfully", record);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// ✅ Delete Category
export const deleteCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const record = await DeleteCategoryByID(id);
    return apiResponse.successResponseWithData(res, "Deleted successfully", { id: record });
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};
