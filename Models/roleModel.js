import { Role } from "../Schema/role.js";

// Create or Update Role (upsert style)
export const saveRole = async (data) => {
  let role = await Role.findOne({ where: { name: data.name } });
  if (role) {
    await role.update(data);
  } else {
    role = await Role.create(data);
  }
  return role;
};

// Get a single Role by condition
export const getRole = async (where = {}) => {
  return await Role.findOne({ where });
};

// Get all Roles
export const getRoles = async () => {
  return await Role.findAll();
};


export { Role };