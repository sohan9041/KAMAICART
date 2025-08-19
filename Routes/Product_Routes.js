import express from "express";
import { upload } from "../MiddleWere/Image_Upload_Middleware.js";
import { ProductController } from "../Controllers/Product_Controller.js";

export const ProductRouter = express.Router();

ProductRouter.post(
  "/Added",
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
