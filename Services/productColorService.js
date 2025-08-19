import { ProductColour } from "../Models/productColorModel.js";

export const ProductColourService = {
  async createColours(product_id, colours) {
    if (!colours || colours.length === 0) return [];
    return await ProductColour.BulkInsert(product_id, colours);
  },
};
