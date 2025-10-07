import * as productVariantModel from "../Models/productVariantModel.js";
import apiResponse from "../Helper/apiResponse.js";

export const addProductVariant = async (req, res) => {
  try {
    const variant = await productVariantModel.createProductVariant(req.body);
    return apiResponse.successResponseWithData(res, "Variant created", variant);
  } catch (error) {
    return apiResponse.ErrorResponse(res, error.message);
  }
};

export const getProductVariants = async (req, res) => {
  try {
    const variants = await productVariantModel.getAllProductVariants();
    return apiResponse.successResponseWithData(res, "Fetched successfully", variants);
  } catch (error) {
    return apiResponse.ErrorResponse(res, error.message);
  }
};

export const getProductVariant = async (req, res) => {
  try {
    const variant = await productVariantModel.getProductVariantById(req.params.id);
    if (!variant) return apiResponse.notFoundResponse(res, "Variant not found");
    return apiResponse.successResponseWithData(res, "Fetched successfully", variant);
  } catch (error) {
    return apiResponse.ErrorResponse(res, error.message);
  }
};

export const updateProductVariant = async (req, res) => {
  try {
    const updated = await productVariantModel.updateProductVariantById(req.params.id, req.body);
    if (!updated[0]) return apiResponse.notFoundResponse(res, "Variant not found or already deleted");
    return apiResponse.successResponseWithData(res, "Variant updated successfully");
  } catch (error) {
    return apiResponse.ErrorResponse(res, error.message);
  }
};

export const deleteProductVariant = async (req, res) => {
  try {
    const deleted = await productVariantModel.softDeleteProductVariant(req.params.id);
    if (!deleted[0]) return apiResponse.notFoundResponse(res, "Variant not found");
    return apiResponse.successResponseWithData(res, "Variant deleted successfully");
  } catch (error) {
    return apiResponse.ErrorResponse(res, error.message);
  }
};
