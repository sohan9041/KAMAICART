import { Op } from "sequelize";
import { AdminData } from "../Schema/AdminData.js";

// Register new user
export const Register = async (name, email, phone, role, password) => {
  console.log("Registering user:", name, email, phone, role);

  const user = await AdminData.create({
    name,
    email,
    phoneno: phone,
    password,
    role,
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

// Find user by email or phone
export const findUserByEmailorPhone = async (identifier) => {
  return await AdminData.findOne({
    where: {
      [Op.or]: [{ email: identifier }, { phoneno: identifier }],
    },
  });
};

// Update password
export const Updatepassword = async (email, password) => {
  await AdminData.update({ password }, { where: { email } });
  return await AdminData.findOne({ where: { email } });
};
