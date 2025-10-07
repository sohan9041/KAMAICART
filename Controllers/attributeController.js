import {
  Attribute,
  createAttribute,
  getAllAttributes,
  getAttributeById,
  updateAttribute,
  deleteAttribute,
} from "../Models/attributeModel.js";
import {
  AttributeValue,
  createAttributeValue,
  getValuesByAttributeId,
  updateAttributeValue,
  deleteAttributeValue,
} from "../Models/attributeValueModel.js";
import apiResponse from "../Helper/apiResponse.js";


// ✅ Create Attribute
export const addAttribute = async (req, res) => {
  try {
    const { name, category_id, input_type } = req.body;
    const record = await createAttribute({ name, category_id, input_type });
    return apiResponse.successResponseWithData(res, "Attribute created", record);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// ✅ Get All Attributes
export const getAttributes = async (req, res) => {
  try {
    const records = await getAllAttributes();
    return apiResponse.successResponseWithData(res, "Fetched successfully", records);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// ✅ Get Attribute by ID
export const getAttribute = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await getAttributeById(id);
    if (!record) return apiResponse.notFoundResponse(res, "Attribute not found", []);
    return apiResponse.successResponseWithData(res, "Fetched successfully", record);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// ✅ Update Attribute
// export const updateAttributeById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const record = await updateAttribute(id, req.body);
//     if (!record) return apiResponse.notFoundResponse(res, "Attribute not found", []);
//     return apiResponse.successResponseWithData(res, "Updated successfully", record);
//   } catch (err) {
//     return apiResponse.ErrorResponse(res, err.message);
//   }
// };

export const updateAttributeById = async (req, res) => {
  const t = await Attribute.sequelize.transaction();

  try {
    const { id } = req.params;
    const { name, input_type, values } = req.body; // values = array of strings

    const attribute = await Attribute.findByPk(id, {
      include: [{ model: AttributeValue, as: "values" }],
      transaction: t
    });

    if (!attribute) {
      await t.rollback();
      return apiResponse.notFoundResponse(res, "Attribute not found", []);
    }

    // 1️⃣ Update attribute info
    await attribute.update({ name, input_type }, { transaction: t });

    // 2️⃣ Soft delete values not in the new array
    const valuesToDelete = attribute.values.filter(v => !values.includes(v.value) && !v.is_deleted);
    for (const v of valuesToDelete) {
      await v.update({ is_deleted: true }, { transaction: t });
    }

    // 3️⃣ Add new values or reactivate soft-deleted ones
    for (const val of values) {
      const existing = attribute.values.find(v => v.value === val);
      if (existing) {
        if (existing.is_deleted) {
          // Reactivate soft-deleted value
          await existing.update({ is_deleted: false }, { transaction: t });
        }
      } else {
        // Create new value
        await AttributeValue.create({ attribute_id: id, value: val, is_deleted: false }, { transaction: t });
      }
    }

    await t.commit();

    // Return updated attribute with current values
    const updatedAttribute = await Attribute.findByPk(id, {
      include: [{ model: AttributeValue, as: "values" }]
    });

    return apiResponse.successResponseWithData(res, "Attribute updated successfully", updatedAttribute);

  } catch (err) {
    await t.rollback();
    return apiResponse.ErrorResponse(res, err.message);
  }
};


// ✅ Delete Attribute
export const deleteAttributeById = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteAttribute(id);
    return apiResponse.successResponseWithData(res, "Deleted successfully");
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};



// ============================================
// ✅ Attribute Values CRUD
// ============================================

// ✅ Add Value to Attribute
export const addAttributeValue = async (req, res) => {
  try {
    const { attribute_id, value } = req.body;

    if (!Array.isArray(value)) {
      return apiResponse.ErrorResponse(res, "Value must be an array");
    }

    // Insert each value separately
    const records = await Promise.all(
      value.map((val) => createAttributeValue({ attribute_id, value: val }))
    );

    return apiResponse.successResponseWithData(res, "Values created", records);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};


// ✅ Get Values by Attribute ID
export const getAttributeValues = async (req, res) => {
  try {
    const { attribute_id } = req.params;
    const records = await getValuesByAttributeId(attribute_id);
    return apiResponse.successResponseWithData(res, "Fetched successfully", records);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// ✅ Update Attribute Value
export const updateAttributeValueById = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await updateAttributeValue(id, req.body);
    if (!record) return apiResponse.notFoundResponse(res, "Value not found", []);
    return apiResponse.successResponseWithData(res, "Updated successfully", record);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// ✅ Delete Attribute Value
export const deleteAttributeValueById = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteAttributeValue(id);
    return apiResponse.successResponseWithData(res, "Deleted successfully");
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};
