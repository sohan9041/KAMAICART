import { ProductImage } from "../Models/ProductImage_Model.js";

export const ProductImageService = {
  async createImages(product_id, urls) {
    if (!urls.length) return [];

    const createdImages = await ProductImage.bulkInsert(product_id, urls);
    return createdImages;
  },
};
