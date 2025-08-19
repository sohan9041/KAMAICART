import { sequelize  } from "../Config/connectDb.js";

export const ProductImage = {
  bulkInsert: async (product_id, imageUrls) => {
    console.log(product_id + "productid");
    console.log(imageUrls.length);

    console.log(imageUrls);

    const values = imageUrls.map((url, i) => `($1, $${i + 2})`).join(", ");
    const queryParams = [product_id, ...imageUrls];

    const query = `INSERT INTO product_images (product_id, image_url) VALUES ${values} RETURNING *`;
    const result = await client.query(query, queryParams);

    return result.rows;
  },
};
