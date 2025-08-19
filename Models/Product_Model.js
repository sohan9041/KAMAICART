import { client } from "../Config/connectDb.js";

export const Product = {
  Insert: async (data) => {
    const {
      title,
      description,
      price,
      original_price,
      brand,
      gender,
      fabric,
      stock,
      category_id,
      pattern,
      unique_code,
    } = data;

    const result = await client.query(
      `INSERT INTO products
       (title, description, price, original_price, brand, gender, fabric, stock, category_id, pattern, unique_code)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING id`,
      [
        title,
        description,
        price,
        original_price,
        brand,
        gender,
        fabric,
        stock,
        category_id,
        pattern,
        unique_code,
      ]
    );

    return result.rows[0].id;
  },

  getProductsByCategoryRecursive: async (categoryId) => {
    const query = `
  WITH RECURSIVE category_tree AS (
    SELECT id FROM categories WHERE id = $1
    UNION ALL
    SELECT c.id FROM categories c
    INNER JOIN category_tree ct ON c.parent_id = ct.id
  )
  SELECT
    p.*,
    (
      SELECT pi.image_url
      FROM product_images pi
      WHERE pi.product_id = p.id
      ORDER BY pi.id ASC
      LIMIT 1
    ) AS image
  FROM products p
  WHERE ($1 IS NULL OR p.category_id IN (SELECT id FROM category_tree))
  ORDER BY p.id DESC;
`;
    const result = await client.query(query, [categoryId]);
    return result.rows;
  },

  //aa query no use all catgory find via one id annd that id to that collect all info like detail size colour nd image
  EditProductsByCategoryRecursive: async (productId) => {
    const query = `
    SELECT
  p.*,

  -- 👇 Fetch category hierarchy
  (
    SELECT json_build_object(
      'main', main_cat.id,
      'sub', sub_cat.id,
      'subsub', subsub_cat.id
    )
    FROM categories AS subsub_cat
    LEFT JOIN categories AS sub_cat ON sub_cat.id = subsub_cat.parent_id
    LEFT JOIN categories AS main_cat ON main_cat.id = sub_cat.parent_id
    WHERE subsub_cat.id = p.category_id
  ) AS categories,

  -- 👇 Fetch image URLs
  (
    SELECT json_agg(image_url)
    FROM product_images
    WHERE product_id = p.id
  ) AS images,

  -- 👇 Fetch sizes
  (
    SELECT json_agg(size)
    FROM product_sizes
    WHERE product_id = p.id
  ) AS sizes,

  -- 👇 Fetch colors
  (
    SELECT json_agg(color)
    FROM product_colors
    WHERE product_id = p.id
  ) AS colors

FROM products p
WHERE p.id = $1;

  `;
    const result = await client.query(query, [productId]);
    return result.rows[0];
  },

  UpdateProductsByCategoryRecursive: async (data, id) => {
    const {
      title,
      description,
      price,
      original_price,
      brand,
      gender,
      fabric,
      stock,
      category_id,
      pattern,
    } = data;

    const query = `
  UPDATE products SET
    title = $1,
    description = $2,
    price = $3,
    original_price = $4,
    brand = $5,
    gender = $6,
    fabric = $7,
    stock = $8,
    category_id = $9,
    pattern = $10
  WHERE id = $11
`;

    const values = [
      title,
      description,
      price,
      original_price,
      brand,
      gender,
      fabric,
      stock,
      category_id,
      pattern,
      parseInt(id),
    ];

    const result = await client.query(query, values);
    return parseInt(id);
  },
};
