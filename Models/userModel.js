import { Op } from "sequelize";
import { User } from "../Schema/user.js";

// Register new user
export const Register = async (name, email, phone, password, role_id) => {
  const user = await User.create({ name, email, phoneno: phone, password, role_id });
  return { id: user.id, name: user.name, email: user.email,phone:user.phoneno, role_id: user.role_id };
};

// Find user by email or phone
export const findUserByEmailorPhone = async (identifier) => {
  return await User.findOne({
    where: { [Op.or]: [{ email: identifier }, { phoneno: identifier }] },
  });
};

// Update password
export const Updatepassword = async (email, password) => {
  await User.update({ password }, { where: { email } });
  return await User.findOne({ where: { email } });
};

export const AppRegister = async (name, email, phone, password, role_id) => {
  const user = await User.create({ name, email, phoneno: phone, password, role_id });
  return { id: user.id, name: user.name, email: user.email,phone:user.phoneno, role_id: user.role_id };
};

export const findUserByEmailorPhoneByApp = async (email,phone) => {
  return await User.findOne({
    where: { [Op.or]: [{ email: email }, { phoneno: phone }] },
  });
};


export const saveUser = async (data) => {
  return await User.create(data);
};

// 🔹 Get All Users (Paginated, only role_id = 4)
export const getAllUsers = async (page, limit) => {
  const offset = (page - 1) * limit;
  return await User.findAndCountAll({
    where: {
      role_id: 4,
      status: ['active', 'inactive'] 
    },
    limit,
    offset,
    order: [["id", "DESC"]],
    attributes: { exclude: ["password"] } // don’t send password
  });
};

// 🔹 Get User by ID
export const getUserByIdModel = async (id) => {
  return await User.findOne({
    where: { id, role_id: 4 },
    attributes: { exclude: ["password"] }
  });
};

// 🔹 Update User
export const updateUserModel = async (id, data) => {
  await User.update(data, { where: { id, role_id: 4 } });
  return await getUserByIdModel(id);
};

// 🔹 Soft Delete User
export const softDeleteUser = async (id) => {
  const seller = await getSellerByIdModel(id);
    if (!seller) return null;
  
    await User.update({ status: "delete" }, { where: { id } });
    return true;
};

// 🔹 Toggle User Status (active/inactive)
export const toggleUserStatusModel = async (id, status) => {
  const user = await User.findOne({ where: { id, role_id: 4 } });
  if (!user) return null;

  await User.update({ status }, { where: { id, role_id: 4 } });
  return await getUserByIdModel(id);
};
// ✅ Export User model as well
export { User };
