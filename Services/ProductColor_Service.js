import { ProductColour } from "../Models/ProductColor_Model.js";

export const ProductColourService = {
  async createColours(product_id, colours) {
    if (!colours || colours.length === 0) return [];
    return await ProductColour.BulkInsert(product_id, colours);
  },
};
