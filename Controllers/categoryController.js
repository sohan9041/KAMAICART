import {
  Category,
  InsertMainCategory,
  InsertSubCategory,
  GetInfoFromCategoriesData,
  GetInfoOnlySubCategory,
  GetInfoOnlySubSubCategory,
  UpdateCategoryByID,
  DeleteCategoryByID,
  GetThreeLevelCategoriesData ,
  GetCategoryByID
} from "../Models/cateogryModel.js"; // adjust path if needed
import apiResponse from "../Helper/apiResponse.js";
import appapiResponse from "../Helper/appapiResponse.js";
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

export const swipeCategories = async (req, res) => {
  try {
    const { ids } = req.body; // Example: [5, 3, 7, 2, 1]

    if (!ids || !Array.isArray(ids)) {
      return apiResponse.ErrorResponse(res, "Invalid input. Provide array of ids.");
    }

    // Loop and update priority based on index
    for (let i = 0; i < ids.length; i++) {
      await Category.update(
        { priority: i + 1 }, // priority starts from 1
        { where: { id: ids[i] } }
      );
    }

    const parent_id = req.query.parent_id || "null";
    const records = await GetInfoFromCategoriesData(parent_id);

    return apiResponse.successResponseWithData(res, "Priorities updated successfully",records);
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
    const id = req.params.id;
    const { name,parent_id } = req.body;
    const image = req.file ? `/uploads/category/${req.file.filename}` : null;

    const record = await UpdateCategoryByID({ id, name,parent_id,image});
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
    return apiResponse.successResponseWithData(res, "Deleted successfully", record);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// get Category by ID
export const getCategoryById = async (req, res) => {
  try {
    const id = req.params.id;
    const record = await GetCategoryByID(id);
    return apiResponse.successResponseWithData(res, "Fetched successfully", record);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
}


export const getThreeLevelCategories = async (req, res) => {
  try {
    const records = await GetThreeLevelCategoriesData();
    return appapiResponse.successResponseWithData(res, "Fetched successfully", records);
  } catch (err) {
    return appapiResponse.ErrorResponse(res, err.message);
  }
};