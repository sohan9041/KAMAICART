import { User } from "../Schema/user.js";// adjust import to your sequelize connection
import { SellerProfile } from "../Schema/sellerProfile.js";// adjust import to your sequelize connection
import { Op } from "sequelize";
// 🔹 Create Seller
export const saveSeller = async (data) => {
  return await User.create(data);
};

// 🔹 Get All Sellers (role_id = 2 or 3 only)
export const getAllSellers = async (page = 1, limit = 10, filters = {}) => {
  const offset = (page - 1) * limit;

  let where = { role_id: [2, 3] }; // base condition

  if (filters.name) {
    where.name = { [Op.like]: `%${filters.name}%` };
  }
  if (filters.email) {
    where.email = { [Op.like]: `%${filters.email}%` };
  }
  if (filters.phoneno) {
    where.phoneno = { [Op.like]: `%${filters.phoneno}%` };
  }
  if (filters.status) {
    where.status = filters.status; // exact match
  }

  return await User.findAndCountAll({
    where,
    attributes: { exclude: ["password"] },
    limit,
    offset,
    order: [["created_at", "DESC"]],
  });
};


export const toggleSellerStatusModel = async (id,toggleSellerStatus) => {
  const seller = await getSellerByIdModel(id);
  if (!seller) return null;

  await User.update({ status: toggleSellerStatus }, { where: { id } });

  return { ...seller.dataValues, status: toggleSellerStatus };
};

// 🔹 Get Seller By ID
export const getSellerByIdModel = async (id) => {
  return await User.findOne({
    where: { id, role_id: [2, 3] }, // only sellers
    attributes: { exclude: ["password"] },
    include: [
      {
        model: SellerProfile,
        as: "sellerProfile", // ✅ must match association alias
        attributes: {
          exclude: ["createdAt", "updatedAt"], // optional
        },
      },
    ],
  });
};

// 🔹 Update Seller
export const updateSellerModel = async (id, data) => {
  await User.update(data, { where: { id, role_id: [2, 3] } });
  return await getSellerByIdModel(id);
};

// 🔹 Soft Delete Seller (set status inactive)
export const softDeleteSeller = async (id) => {
  const seller = await getSellerByIdModel(id);
  if (!seller) return null;

  await User.update({ status: "delete" }, { where: { id } });
  return true;
};

export { User };

export { SellerProfile };