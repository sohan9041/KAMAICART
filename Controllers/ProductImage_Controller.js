import { ProductImageService } from "../Services/ProductImage_Service.js";

export const ProductController = {
  async uploadProductImages(req, res) {
    try {
      const { product_id } = req.body; // assume image_urls is an array
      const image_urls = req.files.map((file) => file.path); // Cloudinary image URL

      const images = await ProductImageService.createImages(
        product_id,
        image_urls
      );
      res.status(201).json(images);
    } catch (error) {
      console.error("Error inserting images:", error);
      res.status(500).json({ error: "Failed to insert images" });
    }
  },
};
