// Models/userAddressModel.js
import userAddress from "../Schema/userAddress.js";

// ✅ Create
export const createuserAddress = async (data) => {
  return await userAddress.create(data);
};

//Get by ID
export const getuserAddressById = async (id) => {
  return await userAddress.findOne({ where: { id, is_deleted: false } });
};

// ✅ Get by User ID
export const getuserAddressByuserId = async (user_id) => {
  return await userAddress.findAll({
    where: { user_id, is_deleted: false },
    order: [["default_address", "DESC"], ["id", "DESC"]], // default first, then latest
  });
};

// ✅ Update Address by ID
export const updateuserAddress = async (id, data) => {
  const [updated] = await userAddress.update(data, { where: { id }, returning: true });
  if (!updated) return null;
  return await userAddress.findByPk(id);
};

// ✅ Soft Delete
export const deleteuserAddress = async (id) => {
  const [deleted] = await userAddress.update({ is_deleted: true }, { where: { id } });
  return deleted;
};

export { userAddress }