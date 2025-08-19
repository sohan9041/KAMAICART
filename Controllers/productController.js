import { ProductColourService } from "../Services/productColorService.js";
import { ProductImageService } from "../Services/productImageService.js";
import { ProductSizeService } from "../Services/productSizeService.js";
import {
  generateProductCode,
  ProductService,
} from "../Services/productService.js";
import { sequelize } from "../Config/connectDb.js";
import cloudinary from "../Helper/cloudinary.js";

export const ProductController = {
  async CreateProduct(req, res) {
    const uploadedImages = [];

    try {
      const image_urls = req.files.map((file) => {
        uploadedImages.push({ url: file.path, public_id: file.filename });
        return file.path;
      });

      const { sizes, colours, ...ProductData } = req.body;

      console.log(ProductData.category_id);

      ProductData.unique_code = await generateProductCode(
        ProductData.category_id
      );
      const parsedSizes = Array.isArray(sizes) ? sizes : [sizes];
      const parsedColours = Array.isArray(colours) ? colours : [colours];

      await client.query("BEGIN");
      const product_id = await ProductService.createProduct(ProductData);

      const images = await ProductImageService.createImages(
        product_id,
        image_urls
      );
      const sizeRecords = await ProductSizeService.CreateSize(
        product_id,
        parsedSizes
      );
      const colourRecords = await ProductColourService.createColours(
        product_id,
        parsedColours
      );
      await client.query("COMMIT");

      res.status(201).json({
        message: "Product created",
        product_id,
        images,
        sizes: sizeRecords,
        colours: colourRecords,
      });
    } catch (error) {
      await client.query("ROLLBACK");
      for (const img of uploadedImages) {
        try {
          await cloudinary.uploader.destroy(img.public_id);
        } catch (e) {
          console.warn("Cloudinary cleanup failed:", e.message);
        }
      }

      console.error(" Product creation failed:", error);
      res.status(500).json({ error: "Failed to create product" });
    }
  },

  async getProductsByCategory(req, res) {
    try {
      const categoryId = req.params.category_id
        ? parseInt(req.params.category_id)
        : null;

      const products = await ProductService.getProductsByCategory(categoryId);
      res.status(200).json(products);
    } catch (error) {
      console.error("❌ Error fetching products:", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  async editProductByCategory(req, res) {
    const productId = parseInt(req.params.id);

    try {
      if (!productId)
        return res.status(400).json({ error: "Invalid product ID" });

      const Product = await ProductService.editProductByCategory(productId);
      if (!Product) return res.status(404).json({ error: "Product not found" });
      res.status(200).json(Product);
    } catch (error) {
      console.error("❌ Error:", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  async UpdateProductByCategory(req, res) {
    const { id } = req.params;

    const { ...ProductData } = req.body;

    try {
      await client.query("BEGIN");
      const product_id = await ProductService.UpdateProductByCategory(
        ProductData,
        id
      );
      await client.query("COMMIT");
      res.status(201).json({
        message: "Product created",
        product_id,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({ error: "Failed to create product" });
    }
  },
};
