import { WhyChoose } from "../Schema/whyChoose.js";

// Create or Update (upsert style)
export const saveWhyChoose = async (data) => {
  let record = await WhyChoose.findOne({ where: { title: data.title } });
  if (record) {
    await record.update(data);
  } else {
    record = await WhyChoose.create(data);
  }
  return record;
};

// Get a single record by condition
export const getWhyChoose = async (where = {}) => {
  return await WhyChoose.findOne({ where: { ...where, is_delete: false } });
};

// ✅ Get all records
export const getAll = async () => {
  const records = await WhyChoose.findAll();

  return records.map((record) => ({
    ...record.toJSON(),
    icon: record.icon ? `${process.env.BASE_URL}${record.icon}` : null,
  }));
};

// ✅ Get only not deleted records
export const getNotDeleteWhyChoose = async () => {
  const records = await WhyChoose.findAll({ where: { is_delete: false } });

  return records.map((record) => ({
    ...record.toJSON(),
    icon: record.icon ? `${process.env.BASE_URL}${record.icon}` : null,
  }));
};
// Soft delete a record
export const softDeleteWhyChoose = async (id) => {
  const record = await WhyChoose.findByPk(id);
  if (!record) return null;
  await record.update({ is_delete: true });
  return record;
};

export { WhyChoose };
