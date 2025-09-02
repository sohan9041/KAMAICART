// Models/productModel.js
import Product from "../Schema/product.js";

// ✅ Create
export const createProduct = async (data) => {
  return await Product.create(data);
};

// ✅ Get All (excluding deleted)
export const getAllProducts = async () => {
  return await Product.findAll({ where: { is_deleted: false } });
};

// ✅ Get by ID
export const getProductById = async (id) => {
  return await Product.findOne({ where: { id, is_deleted: false } });
};

// ✅ Update
export const updateProduct = async (id, data) => {
  const [updated] = await Product.update(data, { where: { id }, returning: true });
  if (!updated) return null;
  return await Product.findByPk(id);
};

// ✅ Soft Delete
export const deleteProduct = async (id) => {
  const [deleted] = await Product.update({ is_deleted: true }, { where: { id } });
  return deleted;
};


export { Product };