import { saveSetting, getSetting } from "../Models/generalSettingModel.js";
import apiResponse from "../Helper/apiResponse.js";

// Save or Update General Setting
export const saveGeneralSetting = async (req, res) => {
  try {
    let data = { ...req.body };

    // If logo uploaded
    if (req.files?.logo) {
      data.logo = `/uploads/settings/${req.files.logo[0].filename}`;
    } else {
      delete data.logo; // prevent overwriting with null/undefined
    }
console.log(req.files?.favicon);
console.log(req.files);
    // If favicon uploaded
    if (req.files?.favicon) {
      data.favicon = `/uploads/settings/${req.files.favicon[0].filename}`;
    } else {
      delete data.favicon;
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

    // const updatedSetting = {
    //   ...setting.toJSON(), // if it's Sequelize/Mongoose instance
    //   logo: setting.logo,
    //   favicon:setting.favicon,
    // };

    return apiResponse.successResponseWithData(
      res,
      "General settings fetched successfully",
      setting
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
