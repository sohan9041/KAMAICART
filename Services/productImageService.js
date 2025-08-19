import { ProductImage } from "../Models/productImageModel.js";

export const ProductImageService = {
  async createImages(product_id, urls) {
    if (!urls.length) return [];

    const createdImages = await ProductImage.bulkInsert(product_id, urls);
    return createdImages;
  },
};
