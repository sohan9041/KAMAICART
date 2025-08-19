import { client } from "../Config/connectDb.js";
import slugify from "slugify";

const slug = async (name) => {
  if (!name || typeof name !== "string")
    throw new Error("slug name is required");
  const slug = slugify(name, { lower: true }); // → women-ethnic
  const unique_code = name.toUpperCase().replace(/[^A-Z0-9]+/g, "_");
  return { slug, unique_code };
};

export const InsertMainCategory = async (name) => {
  if (!name) throw new Error("Category name is required");

  console.log(name);
  const data = await slug(name);

  const query = `
    INSERT INTO categories (name, slug, unique_code, parent_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *`;
  const values = [name, data.slug, data.unique_code, null];
  const result = await client.query(query, values);
  return result.rows[0];
};

export const InsertSubCategory = async (data) => {
  const { name, parent_id } = data;
  if (!name) throw new Error("Category name is required");

  const data1 = await slug(name);

  const query = `
    INSERT INTO categories (name, slug, unique_code, parent_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *`;
  const values = [name, data1.slug, data1.unique_code, parent_id];
  const result = await client.query(query, values);
  return result.rows[0];
};

export const GetInfoFromCategoriesData = async (parent_id) => {
  const query =
    parent_id === "null"
      ? "SELECT * FROM categories WHERE parent_id IS NULL ORDER BY id"
      : "SELECT * FROM categories WHERE parent_id = $1 ORDER BY id";
  const values = parent_id === "null" ? [] : [parent_id];
  const { rows } = await client.query(query, values);
  return rows;
};

export const GetInfoOnlySubCategory = async () => {
  const query =
    "SELECT c.*FROM categories c JOIN categories p ON c.parent_id = p.id WHERE p.parent_id IS NULL;";

  const { rows } = await client.query(query);
  return rows;
};

export const GetInfoOnlySubSubCategory = async () => {
  const query =
    "SELECT c.*FROM categories c JOIN categories p ON c.parent_id = p.id WHERE p.parent_id IS NOT NULL;";

  const { rows } = await client.query(query);
  return rows;
};

export const UpdateCategoryByID = async (data) => {
  const { name, id } = data;
  const id1 = id ? id : null;

  const query = `
    UPDATE categories
    SET name = $1, slug = $2, unique_code = $3
    WHERE id = $4
    RETURNING *;
  `;

  const dataslug = await slug(name);
  const values = [name, dataslug.slug, dataslug.unique_code, id1];
  const result = await client.query(query, values);
  return result.rows[0];
};

export const DeleteCategoryByID = async (id) => {
  const query = `DELETE FROM categories WHERE id = $1`;

  const values = [id];
  await client.query(query, values);

  return id;
};
