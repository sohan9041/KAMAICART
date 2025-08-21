import { RoleFeature } from "../Schema/roleFeature.js";

// Create / Update Role Feature
export const saveRoleFeature = async (data) => {
  let feature = await RoleFeature.findOne({ where: { role_id: data.role_id, feature: data.feature } });
  if (feature) {
    await feature.update(data);
  } else {
    feature = await RoleFeature.create(data);
  }
  return feature;
};

// Get features by Role ID
export const getRoleFeatures = async (role_id) => {
  return await RoleFeature.findAll({ where: { role_id } });
};

// Get one feature
export const getRoleFeature = async (where = {}) => {
  return await RoleFeature.findOne({ where });
};

// Delete feature by ID
export const deleteRoleFeature = async (id) => {
  return await RoleFeature.destroy({ where: { id } });
};

export { RoleFeature };
