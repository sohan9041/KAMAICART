import Attribute from "../Schema/attribute.js";
import AttributeValue from "../Schema/attributeValue.js";

// ✅ Create Attribute
export const createAttribute = async (data) => {
  return await Attribute.create(data);
};

// ✅ Get all Attributes (with values if needed)
export const getAllAttributes = async () => {
  return await Attribute.findAll({
    include: [{ model: AttributeValue, as: "values" }],
  });
};

// ✅ Get Attribute by ID
export const getAttributeById = async (id) => {
  return await Attribute.findByPk(id, {
    include: [{ model: AttributeValue, as: "values" }],
  });
};

// ✅ Update Attribute
export const updateAttribute = async (id, data) => {
  const attribute = await Attribute.findByPk(id);
  if (!attribute) return null;
  await attribute.update(data);
  return attribute;
};

export const deleteAttribute = async (id) => {
  return await Attribute.update(
    { is_deleted: true },
    { where: { id } }
  );
};
