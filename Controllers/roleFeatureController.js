import { RoleFeature } from "../Models/roleFeatureModel.js";
import { Role } from "../Models/roleModel.js";
import apiResponse from "../Helper/apiResponse.js";

// Create or Update RoleFeature
export const createOrUpdateRoleFeature = async (req, res) => {
  try {
    const { id, feature, role_id } = req.body;

    let roleFeature;
    if (id) {
      roleFeature = await RoleFeature.findByPk(id);
      if (!roleFeature) {
        return apiResponse.notFoundResponse(res, "Role Feature not found", []);
      }
      await roleFeature.update({ feature, role_id });
    } else {
      roleFeature = await RoleFeature.create({ feature, role_id });
    }

    return apiResponse.successResponseWithData(
      res,
      "Role Feature saved successfully",
      roleFeature
    );
  } catch (error) {
    return apiResponse.ErrorResponse(res, error.message);
  }
};

// Get single RoleFeature by ID
export const getRoleFeatureById = async (req, res) => {
  try {
    const roleFeature = await RoleFeature.findByPk(req.params.id, {
      include: { model: Role, as: "role" },
    });

    if (!roleFeature) {
      return apiResponse.notFoundResponse(res, "Role Feature not found", []);
    }

    return apiResponse.successResponseWithData(
      res,
      "Role Feature fetched successfully",
      roleFeature
    );
  } catch (error) {
    return apiResponse.ErrorResponse(res, error.message);
  }
};

// Get all RoleFeatures
export const getAllRoleFeatures = async (req, res) => {
  try {
    const roleFeatures = await RoleFeature.findAll({
      include: { model: Role, as: "role" },
    });

    if (!roleFeatures || roleFeatures.length === 0) {
      return apiResponse.notFoundResponse(res, "No Role Features found", []);
    }

    return apiResponse.successResponseWithData(
      res,
      "Role Features fetched successfully",
      roleFeatures
    );
  } catch (error) {
    return apiResponse.ErrorResponse(res, error.message);
  }
};

// Delete RoleFeature
export const deleteRoleFeatureById = async (req, res) => {
  try {
    const roleFeature = await RoleFeature.findByPk(req.params.id);
    if (!roleFeature) {
      return apiResponse.notFoundResponse(res, "Role Feature not found", []);
    }

    await roleFeature.destroy();

    return apiResponse.successResponse(res, "Role Feature deleted successfully");
  } catch (error) {
    return apiResponse.ErrorResponse(res, error.message);
  }
};
