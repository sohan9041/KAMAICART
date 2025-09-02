import ProductVariant from "../Schema/productVariant.js";

export const createProductVariant = async (data) => {
  return await ProductVariant.create(data);
};

export const getAllProductVariants = async () => {
  return await ProductVariant.findAll({ where: { is_deleted: false } });
};

export const getProductVariantById = async (id) => {
  return await ProductVariant.findOne({ where: { id, is_deleted: false } });
};

export const updateProductVariantById = async (id, data) => {
  return await ProductVariant.update(data, { where: { id, is_deleted: false } });
};

export const softDeleteProductVariant = async (id) => {
  return await ProductVariant.update(
    { is_deleted: true },
    { where: { id } }
  );
};

export { ProductVariant };