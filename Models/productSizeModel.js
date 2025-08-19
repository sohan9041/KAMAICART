import { sequelize  } from "../Config/connectDb.js";

export const ProductSize = {
  BulkInsert: async (product_id, sizes) => {
    const value = sizes.map((_, i) => `($1, $${i + 2})`).join(", ");
    const queryParams = [product_id, ...sizes];

    const query = `INSERT INTO product_sizes (product_id, size) VALUES ${value}RETURNING *`;
    const result = await client.query(query, queryParams);
    return result.rows;
  },
};
