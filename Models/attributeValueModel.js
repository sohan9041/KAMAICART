import AttributeValue from "../Schema/attributeValue.js";

// ✅ Create Attribute Value
export const createAttributeValue = async (data) => {
  return await AttributeValue.create(data);
};

// ✅ Get all values for an attribute
export const getValuesByAttributeId = async (attributeId) => {
  return await AttributeValue.findAll({ where: { attribute_id: attributeId } });
};

// ✅ Update Attribute Value
export const updateAttributeValue = async (id, data) => {
  const value = await AttributeValue.findByPk(id);
  if (!value) return null;
  await value.update(data);
  return value;
};

// ✅ Soft Delete Attribute Value
export const deleteAttributeValue = async (id) => {
  return await AttributeValue.update(
    { is_deleted: true },
    { where: { id } }
  );
};

