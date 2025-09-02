import ProductVariantAttributeValue from "../Schema/productVariantAttributeValue.js";

export const createProductVariant = async (data) => {
  return await ProductVariantAttributeValue.create(data);
};

export const getAllProductVariants = async () => {
  return await ProductVariantAttributeValue.findAll({ where: { is_deleted: false } });
};

export const getProductVariantById = async (id) => {
  return await ProductVariantAttributeValue.findOne({ where: { id, is_deleted: false } });
};

export const updateProductVariantById = async (id, data) => {
  return await ProductVariantAttributeValue.update(data, { where: { id, is_deleted: false } });
};

export const softDeleteProductVariant = async (id) => {
  return await ProductVariantAttributeValue.update(
    { is_delete: true },
    { where: { id } }
  );
};

export { ProductVariantAttributeValue };