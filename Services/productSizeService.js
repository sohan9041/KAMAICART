import { ProductSize } from "../Models/productSizeModel.js";

export const ProductSizeService = {
  async CreateSize(product_id, sizes) {
    if (!sizes || sizes.length === 0) return [];
    return await ProductSize.BulkInsert(product_id, sizes);
  },
};
