import { saveSetting, getSetting } from "../Models/generalSettingModel.js";
import apiResponse from "../Helper/apiResponse.js";

// Save or Update General Setting
export const saveGeneralSetting = async (req, res) => {
  try {
    let data = { ...req.body };

    // check if an image file is uploaded
    if (req.file) {
      data.logo = `/uploads/settings/${req.file.filename}`;
    }

    const setting = await saveSetting(data);

    return apiResponse.successResponseWithData(
      res,
      "General settings saved successfully",
      setting
    );
  } catch (error) {
    console.error("Error saving settings:", error.message);
    return apiResponse.ErrorResponse(
  res,
  "Failed to save general settings",
  error.message
);
  }
};

// Get General Setting
export const getGeneralSetting = async (req, res) => {
  try {
    const setting = await getSetting();

    if (!setting) {
      return apiResponse.notFoundResponse(res, "No general settings found");
    }

    // Attach full URL for logo/image paths
    const baseUrl = process.env.BASE_URL;

    const updatedSetting = {
      ...setting.toJSON(), // if it's Sequelize/Mongoose instance
      logo: setting.logo ? `${baseUrl}${setting.logo}` : null,
      favicon:setting.favicon ? `${baseUrl}${setting.favicon}` : null,
    };

    return apiResponse.successResponseWithData(
      res,
      "General settings fetched successfully",
      updatedSetting
    );
  } catch (error) {
    console.error("Error fetching settings:", error);
    return apiResponse.ErrorResponse(
      res,
      "Failed to fetch general settings",
      error.message
    );
  }
};
