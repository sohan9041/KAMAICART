import {
  InsertMainCategory,
  GetInfoFromCategoriesData,
  InsertSubCategory,
  GetInfoOnlySubCategory,
  GetInfoOnlySubSubCategory,
  UpdateCategoryByID,
  DeleteCategoryByID,
} from "../Models/cateogryModel.js";

export const CreateMainCategory = async ({ name }) => {
  if (!name) throw new Error("Category name is required");
  return await InsertMainCategory(name);
};

export const FetchInfoCategories = async (parent_id) => {
  return await GetInfoFromCategoriesData(parent_id);
};

export const CreateSubCategory = async (data) => {
  return await InsertSubCategory(data);
};

export const FetchInfoSubCategories = async (data) => {
  return await GetInfoOnlySubCategory(data);
};

export const FetchInfoSubSubCategories = async (data) => {
  return await GetInfoOnlySubSubCategory(data);
};

export const UpdateCategory = async (data) => {
  return await UpdateCategoryByID(data);
};

export const DeleteCategory = async (id) => {
  return await DeleteCategoryByID(id);
};
