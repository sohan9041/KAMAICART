import { sequelize  } from "../Config/connectDb.js";

export const ProductColour = {
  BulkInsert: async (product_id, colours) => {
    const value = colours.map((_, i) => `($1, $${i + 2})`).join(", ");
    const queryParams = [product_id, ...colours];

    const query = `INSERT INTO product_colors (product_id, color) VALUES ${value}RETURNING *`;
    const result = await client.query(query, queryParams);
    return result.rows;
  },
};
