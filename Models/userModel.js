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

// ✅ Export User model as well
export { User };
