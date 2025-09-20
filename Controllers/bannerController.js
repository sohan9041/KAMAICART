import { Banner,saveBanner, getAllBanners, softDeleteBanner } from "../Models/bannerModel.js";
import apiResponse from "../Helper/apiResponse.js";
import appapiResponse from "../Helper/appapiResponse.js";

// ✅ Create Banner (only image)
export const createBanner = async (req, res) => {
  try {
    if (!req.file) {
      return apiResponse.validationErrorWithData(res, "Image is required", null);
    }
    if (!req.body.type) {
      return apiResponse.validationErrorWithData(res, "Type (web/app) is required", null);
    }

    const data = {
      image: `/uploads/banner/${req.file.filename}`,
      type: req.body.type,
      title:req.body.title
    };

    const record = await saveBanner(data);
    return apiResponse.successResponseWithData(res, "Banner uploaded successfully", record);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// ✅ Get All
export const getBannerList = async (req, res) => {
  try {
    const records = await getAllBanners();

    // prepend base URL from env
    const updatedRecords = records.map((banner) => {
      return {
        ...banner.dataValues,
        image: banner.image,
      };
    });

    return apiResponse.successResponseWithData(res, "Fetched successfully", updatedRecords);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// ✅ Get Banners by Type
export const getBannerByType = async (req, res) => {
  try {
    const { type } = req.params;

    const records = await Banner.findAll({
      where: { is_delete: false, type }
    });

    const updatedRecords = records.map((banner) => ({
      ...banner.dataValues,
      image: banner.image,
    }));

    return apiResponse.successResponseWithData(res, "Fetched successfully", updatedRecords);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

export const getBannerByTypeapp = async (req, res) => {
  try {
    const { type } = req.params;

    const records = await Banner.findAll({
      where: { is_delete: false, type }
    });
    const updatedRecords = records.map((banner) => ({
      ...banner.dataValues,
      image: banner.image,
    }));

    return appapiResponse.successResponseWithData(res, "Fetched successfully", updatedRecords);
  } catch (err) {
    return appapiResponse.ErrorResponse(res, err.message);
  }
};


// ✅ Soft Delete
export const deleteBanner = async (req, res) => {
  try {
    const record = await softDeleteBanner(req.params.id);
    if (!record) return apiResponse.notFoundResponse(res, "Banner not found", []);
    return apiResponse.successResponseWithData(res, "Deleted successfully");
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};
