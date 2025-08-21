import { Op } from "sequelize";
import { User } from "../Schema/user.js";

// Register new user
export const Register = async (name, email, phone, password, role) => {
  const user = await User.create({ name, email, phoneno: phone, password, role });
  return { id: user.id, name: user.name, email: user.email, role: user.role };
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

// ✅ Export User model as well
export { User };
