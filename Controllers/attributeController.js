import {
  createAttribute,
  getAllAttributes,
  getAttributeById,
  updateAttribute,
  deleteAttribute,
} from "../Models/attributeModel.js";
import {
  createAttributeValue,
  getValuesByAttributeId,
  updateAttributeValue,
  deleteAttributeValue,
} from "../Models/attributeValueModel.js";
import apiResponse from "../Helper/apiResponse.js";


// ✅ Create Attribute
export const addAttribute = async (req, res) => {
  try {
    const { name, category_id, input_type } = req.body;
    const record = await createAttribute({ name, category_id, input_type });
    return apiResponse.successResponseWithData(res, "Attribute created", record);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// ✅ Get All Attributes
export const getAttributes = async (req, res) => {
  try {
    const records = await getAllAttributes();
    return apiResponse.successResponseWithData(res, "Fetched successfully", records);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// ✅ Get Attribute by ID
export const getAttribute = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await getAttributeById(id);
    if (!record) return apiResponse.notFoundResponse(res, "Attribute not found", []);
    return apiResponse.successResponseWithData(res, "Fetched successfully", record);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// ✅ Update Attribute
export const updateAttributeById = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await updateAttribute(id, req.body);
    if (!record) return apiResponse.notFoundResponse(res, "Attribute not found", []);
    return apiResponse.successResponseWithData(res, "Updated successfully", record);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// ✅ Delete Attribute
export const deleteAttributeById = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteAttribute(id);
    return apiResponse.successResponse(res, "Deleted successfully");
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};



// ============================================
// ✅ Attribute Values CRUD
// ============================================

// ✅ Add Value to Attribute
export const addAttributeValue = async (req, res) => {
  try {
    const { attribute_id, value } = req.body;
    const record = await createAttributeValue({ attribute_id, value });
    return apiResponse.successResponseWithData(res, "Value created", record);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// ✅ Get Values by Attribute ID
export const getAttributeValues = async (req, res) => {
  try {
    const { attribute_id } = req.params;
    const records = await getValuesByAttributeId(attribute_id);
    return apiResponse.successResponseWithData(res, "Fetched successfully", records);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// ✅ Update Attribute Value
export const updateAttributeValueById = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await updateAttributeValue(id, req.body);
    if (!record) return apiResponse.notFoundResponse(res, "Value not found", []);
    return apiResponse.successResponseWithData(res, "Updated successfully", record);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// ✅ Delete Attribute Value
export const deleteAttributeValueById = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteAttributeValue(id);
    return apiResponse.successResponse(res, "Deleted successfully");
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};
