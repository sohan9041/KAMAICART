import express from "express";
import { upload } from "../Middleware/imageUploadMiddleware.js";
import { ProductController } from "../Controllers/productController.js";

export const ProductRouter = express.Router();

ProductRouter.post(
  "/added",
  upload.array("images", 5),
  ProductController.CreateProduct
);

ProductRouter.get("/category", ProductController.getProductsByCategory); // all
ProductRouter.get(
  "/category/:category_id",
  ProductController.getProductsByCategory
);

ProductRouter.get("/info/:id", ProductController.editProductByCategory);

ProductRouter.put(
  "/update/:id",
  upload.any(),
  ProductController.UpdateProductByCategory
);
