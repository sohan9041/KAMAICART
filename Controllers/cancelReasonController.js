import { CancelReason } from "../Models/cancelReasonModel.js";
import apiResponse from "../Helper/apiResponse.js";

// ✅ Create Cancel Reason
export const createCancelReason = async (req, res) => {
  try {
    if (!req.body.reason) {
      return apiResponse.validationErrorWithData(res, "Cancel reason is required", null);
    }

    const data = {
      reason: req.body.reason,
      status: req.body.status ?? true,
    };

    const record = await CancelReason.create(data);
    return apiResponse.successResponseWithData(res, "Cancel reason created successfully", record);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// ✅ Get All Cancel Reasons
export const getCancelReasonList = async (req, res) => {
  try {
    const records = await CancelReason.findAll({
      where: { is_delete: false },
      attributes: { exclude: ["is_delete", "createdAt", "updatedAt"] },
      order: [["id", "ASC"]], // ✅ Order by id ascending
    });

    return apiResponse.successResponseWithData(res, "Fetched successfully", records);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};



// ✅ Get Cancel Reason by ID
export const getCancelReasonById = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await CancelReason.findOne({ where: { id, is_delete: false } });

    if (!record) return apiResponse.notFoundResponse(res, "Cancel reason not found", null);

    return apiResponse.successResponseWithData(res, "Fetched successfully", {
      ...record.dataValues,
    });
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// ✅ Update Cancel Reason
export const updateCancelReason = async (req, res) => {
  try {
    const { id } = req.params;
    const existingRecord = await CancelReason.findOne({ where: { id, is_delete: false } });

    if (!existingRecord) return apiResponse.notFoundResponse(res, "Cancel reason not found", null);

    const data = {
      reason: req.body.reason || existingRecord.reason,
      status: req.body.status ?? existingRecord.status,
    };

    const updatedRecord = await existingRecord.update(data);
    return apiResponse.successResponseWithData(res, "Cancel reason updated successfully", updatedRecord);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// ✅ Soft Delete Cancel Reason
export const deleteCancelReason = async (req, res) => {
  try {
    const record = await CancelReason.findOne({ where: { id: req.params.id, is_delete: false } });

    if (!record) return apiResponse.notFoundResponse(res, "Cancel reason not found", null);

    await record.update({ is_delete: true });
    return apiResponse.successResponseWithData(res, "Cancel reason deleted successfully", null);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};
