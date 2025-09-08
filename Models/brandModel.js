import { Brand } from "../Schema/brand.js";

// ✅ Create
export const saveBrand = async (data) => {
  return Brand.create(data);
};

// ✅ Get All
export const getAllBrands = async () => {
  return Brand.findAll({ where: { is_delete: false } });
};

// ✅ Get By ID
export const getBrandByIdModel = async (id) => {
  return Brand.findByPk(id);
};

// ✅ Update
export const updateBrandModel = async (id, data) => {
  const brand = await Brand.findByPk(id);
  if (!brand) return null;
  brand.name = data.name || brand.name;
  await brand.save();
  return brand;
};

// ✅ Soft Delete
export const softDeleteBrand = async (id) => {
  const brand = await Brand.findByPk(id);
  if (!brand) return null;
  brand.is_delete = true;
  await brand.save();
  return brand;
};


export { Brand };