// Models/productModel.js
import Product from "../Schema/product.js";
import productVariant from "../Schema/productVariant.js";
import productVariantAttributeValue from "../Schema/productVariantAttributeValue.js";
import attribute from "../Schema/attribute.js";
import attributeValue from "../Schema/attributeValue.js";


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

// ✅ Helper: soft delete one variant and return remaining variants
export const softDeleteProductVariantByAttribute = async (productId, attributeValueId) => {
  // 1️⃣ Find all matching variant_ids by attribute_value_id
  const variantAttrs = await productVariantAttributeValue.findAll({
    where: {
      product_id: productId,
      attribute_value_id: attributeValueId, // ✅ match all with this attribute_value_id
    },
    attributes: ["variant_id"],
  });

  if (!variantAttrs || variantAttrs.length === 0) {
    return null; // No matches
  }

  const variantIds = variantAttrs.map(v => v.variant_id);

  // 2️⃣ Soft delete all variants in one go
  await productVariant.update(
    { is_deleted: true },
    { where: { id: variantIds } }
  );

  // 3️⃣ Return all deleted variants with attributes
  const deletedVariants = await productVariant.findAll({
    where: { id: variantIds },
    include: [
      {
        model: productVariantAttributeValue,
        as: "attributes",
        include: [
          { model: attribute, as: "attribute" },
          { model: attributeValue, as: "attribute_value" },
        ],
      },
    ],
  });

  return deletedVariants;
};




export { Product };