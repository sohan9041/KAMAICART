import { Product } from "../Models/productModel.js";
import { client } from "../Config/connectDb.js"; // PostgreSQL DB instance

export const generateProductCode = async (subSubCategoryId) => {
  const prefix = `SG-${subSubCategoryId}-`;

  // Find latest number for this subSubCategory
  const query = `
    SELECT unique_code FROM products
    WHERE category_id = $1
    AND unique_code LIKE $2
    ORDER BY unique_code DESC
    LIMIT 1
  `;
  const { rows } = await client.query(query, [subSubCategoryId, `${prefix}%`]);

  let newNumber = 1;

  if (rows.length > 0) {
    const lastCode = rows[0].unique_code;
    const lastNum = parseInt(lastCode.split("-")[2]);
    newNumber = lastNum + 1;
  }

  const code = `${prefix}${newNumber.toString().padStart(5, "0")}`;
  return code;
};

export const ProductService = {
  async createProduct(data) {
    const product_id = await Product.Insert(data);
    return product_id;
  },
  async getProductsByCategory(categoryId) {
    return await Product.getProductsByCategoryRecursive(categoryId);
  },

  async editProductByCategory(productID) {
    return await Product.EditProductsByCategoryRecursive(productID);
  },

  async UpdateProductByCategory(data, id) {
    return await Product.UpdateProductsByCategoryRecursive(data, id);
  },
};
