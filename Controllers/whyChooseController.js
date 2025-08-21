import { WhyChoose, saveWhyChoose, getNotDeleteWhyChoose,getAll, softDeleteWhyChoose } from "../Models/whyChooseModel.js";
import apiResponse from "../Helper/apiResponse.js";

// ✅ Create or Update
export const createOrUpdateWhyChoose = async (req, res) => {
  try {
    const data = req.body;

    // If file uploaded, save path
    if (req.file) {
      data.icon = `/uploads/icon/${req.file.filename}`;
    }

    const record = await saveWhyChoose(data);
    return apiResponse.successResponseWithData(res, "Saved successfully", record);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// ✅ Get All
export const getWhyChooseList = async (req, res) => {
  try {
    const records = await getAll();
    return apiResponse.successResponseWithData(res, "Fetched successfully", records);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// ✅ Get Not Deleted
export const getWhyChooseListForWeb = async (req, res) => {
  try {
    const records = await getNotDeleteWhyChoose();
    return apiResponse.successResponseWithData(res, "Fetched successfully", records);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// ✅ Soft Delete
export const deleteWhyChoose = async (req, res) => {
  try {
    const record = await softDeleteWhyChoose(req.params.id);
    if (!record) return apiResponse.notFoundResponse(res, "Record not found", []);
    return apiResponse.successResponse(res, "Deleted successfully");
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};
