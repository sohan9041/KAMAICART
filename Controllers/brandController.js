import { Brand, saveBrand, getAllBrands, getBrandByIdModel, updateBrandModel, softDeleteBrand } from "../Models/brandModel.js";
import apiResponse from "../Helper/apiResponse.js";

// ✅ Create Brand
export const createBrand = async (req, res) => {
  try {
    if (!req.body.name) {
      return apiResponse.validationErrorWithData(res, "Brand name is required", null);
    }
   

    const data = {
      name: req.body.name
    };

    const record = await saveBrand(data);
    return apiResponse.successResponseWithData(res, "Brand created successfully", record);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// ✅ Get All Brands
export const getBrandList = async (req, res) => {
  try {
    const records = await getAllBrands();

    const updatedRecords = records.map((brand) => ({
      ...brand.dataValues
    }));

    return apiResponse.successResponseWithData(res, "Fetched successfully", updatedRecords);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// ✅ Get Brand by ID
export const getBrandById = async (req, res) => {
  try {
    const { id } = req.params;
    const brand = await getBrandByIdModel(id);
    if (!brand) return apiResponse.notFoundResponse(res, "Brand not found", null);

    return apiResponse.successResponseWithData(res, "Fetched successfully", {
      ...brand.dataValues
    });
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// ✅ Update Brand
export const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;

    const existingBrand = await getBrandByIdModel(id);
    if (!existingBrand) return apiResponse.notFoundResponse(res, "Brand not found", null);

    const data = {
      name: req.body.name || existingBrand.name
    };

    const updatedBrand = await updateBrandModel(id, data);

    return apiResponse.successResponseWithData(res, "Brand updated successfully", updatedBrand);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// ✅ Soft Delete Brand
export const deleteBrand = async (req, res) => {
  try {
    const record = await softDeleteBrand(req.params.id);
    if (!record) return apiResponse.notFoundResponse(res, "Brand not found", null);

    return apiResponse.successResponseWithData(res, "Brand deleted successfully");
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};
