// ====== controllers/roleController.js ======
import { Role, saveRole, getRole, getRoles } from "../Models/roleModel.js";
import {
  RoleFeature
} from "../Models/roleFeatureModel.js";
import apiResponse from "../Helper/apiResponse.js";

// Create or Update Role
export const createOrUpdateRole = async (req, res) => {
  try {
    const roleData = req.body;

    // ✅ If an icon file is uploaded, add its path
    if (req.file) {
      roleData.icon = `/uploads/icon/${req.file.filename}`;
    }

    let role;

    if (roleData.id) {
      // ✅ Update existing role
      role = await Role.findByPk(roleData.id);
      if (!role) {
        return apiResponse.notFoundResponse(res, "Role not found");
      }
      await role.update(roleData);
    } else {
      // ✅ Create new role
      role = await Role.create(roleData);
    }

    // ✅ Handle features (overwrite old features with new ones)
    if (roleData.features && Array.isArray(roleData.features)) {
      // Remove old features
      await RoleFeature.destroy({ where: { roleId: role.id } });

      // Insert new features
      const featureRecords = roleData.features.map((feature) => ({
        roleId: role.id,
        feature,
      }));
      await RoleFeature.bulkCreate(featureRecords);
    }

    // ✅ Fetch role with features
    const fullRole = await Role.findByPk(role.id, {
      include: { model: RoleFeature, as: "features" },
    });

    return apiResponse.successResponseWithData(
      res,
      "Role saved successfully",
      fullRole
    );
  } catch (error) {
    console.error("Error saving role:", error);
    return apiResponse.ErrorResponse(res, error.message);
  }
};


// Get Role by ID or condition
export const getRoleById = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id, {
      include: { model: RoleFeature, as: "features" },
    });

    if (!role) {
      return apiResponse.notFoundResponse(res, "Role not found", []);
    }

    return apiResponse.successResponseWithData(
      res,
      "Role fetched successfully",
      role
    );
  } catch (error) {
    return apiResponse.ErrorResponse(res, error.message);
  }
};

// Get All Roles
export const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({
      attributes: { exclude: ["createdAt", "updatedAt"] },
      include: {
        model: RoleFeature,
        as: "features",
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
    });

    if (!roles || roles.length === 0) {
      return apiResponse.notFoundResponse(res, "No roles found", []);
    }

    // Add full URL for icon field
    const baseUrl = process.env.BASE_URL || ""; 

    const rolesWithFullIcon = roles.map((role) => {
      return {
        ...role.toJSON(),
        icon: role.icon ? `${baseUrl}${role.icon}` : null, 
      };
    });

    return apiResponse.successResponseWithData(
      res,
      "Roles fetched successfully",
      rolesWithFullIcon
    );
  } catch (error) {
    return apiResponse.ErrorResponse(res, error.message);
  }
};

// Get All Roles
export const getAllRolesforWeb = async (req, res) => {
  try {
    const roles = await Role.findAll({
      where: { is_deleted: false },
      attributes: { exclude: ["createdAt", "updatedAt"] },
      include: {
        model: RoleFeature,
        as: "features",
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
    });

    if (!roles || roles.length === 0) {
      return apiResponse.notFoundResponse(res, "No roles found", []);
    }

    // Add full URL for icon field
    const baseUrl = process.env.BASE_URL || ""; 

    const rolesWithFullIcon = roles.map((role) => {
      return {
        ...role.toJSON(),
        icon: role.icon ? `${baseUrl}${role.icon}` : null, 
      };
    });

    return apiResponse.successResponseWithData(
      res,
      "Roles fetched successfully",
      rolesWithFullIcon
    );
  } catch (error) {
    return apiResponse.ErrorResponse(res, error.message);
  }
};


// Delete Role
export const deleteRole = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) return apiResponse.notFoundResponse(res, "Role not found", []);

    // ✅ Soft delete (instead of destroying the row)
    role.is_deleted = true;
    await role.save();

    return apiResponse.successResponse(res, "Role deleted successfully");
  } catch (error) {
    return apiResponse.ErrorResponse(res, error.message);
  }
};

