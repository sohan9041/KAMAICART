import { Banner } from "../Schema/banner.js";

// ✅ Create
export const saveBanner = async (data) => {
  return Banner.create(data);
};

// ✅ Get All
export const getAllBanners = async () => {
  return Banner.findAll();
};

// ✅ Get Not Deleted
export const getNotDeletedBanners = async () => {
  return Banner.findAll({ where: { is_delete: false } });
};

// ✅ Soft Delete
export const softDeleteBanner = async (id) => {
  const banner = await Banner.findByPk(id);
  if (!banner) return null;
  banner.is_delete = true;
  await banner.save();
  return banner;
};

export { Banner };