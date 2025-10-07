import { Offer } from "../Schema/offer.js";

// ✅ Create
export const saveOffer = async (data) => {
  return Offer.create(data);
};

// ✅ Get All
export const getAllOffers = async () => {
  return Offer.findAll({where: { is_delete: false }});
};

// ✅ Get Not Deleted
export const getNotDeletedOffers = async () => {
  return Offer.findAll({ where: { is_delete: false } });
};

// ✅ Soft Delete
export const softDeleteOffer = async (id) => {
  const offer = await Offer.findByPk(id);
  if (!offer) return null;
  offer.is_delete = true;
  await offer.save();
  return offer;
};

export { Offer };
