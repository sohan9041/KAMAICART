// Controllers/productController.js
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../Models/productModel.js";
import apiResponse from "../Helper/apiResponse.js";

// ✅ Add Product
export const addProduct = async (req, res) => {
  try {
    const record = await createProduct(req.body);
    return apiResponse.successResponseWithData(res, "Product created", record);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// ✅ Get All Products
export const getProducts = async (req, res) => {
  try {
    const records = await getAllProducts();
    return apiResponse.successResponseWithData(res, "Fetched successfully", records);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// ✅ Get Product by ID
export const getProduct = async (req, res) => {
  try {
    const record = await getProductById(req.params.id);
    if (!record) return apiResponse.notFoundResponse(res, "Product not found", []);
    return apiResponse.successResponseWithData(res, "Fetched successfully", record);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// ✅ Update Product
export const updateProductById = async (req, res) => {
  try {
    const record = await updateProduct(req.params.id, req.body);
    if (!record) return apiResponse.notFoundResponse(res, "Product not found", []);
    return apiResponse.successResponseWithData(res, "Updated successfully", record);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// ✅ Soft Delete Product
export const deleteProductById = async (req, res) => {
  try {
    const deleted = await deleteProduct(req.params.id);
    if (!deleted) return apiResponse.notFoundResponse(res, "Product not found", []);
    return apiResponse.successResponse(res, "Deleted successfully");
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};
