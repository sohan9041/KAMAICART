import slugify from "slugify";
import Category from "../Schema/category.js";
import { Op } from "sequelize";

const slug = (name) => {
  if (!name || typeof name !== "string") throw new Error("slug name is required");
  const slug = slugify(name, { lower: true });
  const unique_code = name.toUpperCase().replace(/[^A-Z0-9]+/g, "_");
  return { slug, unique_code };
};

// ✅ Insert Main Category
export const InsertMainCategory = async ({name,image,priority}) => {
  if (!name) throw new Error("Category name is required");
  const { slug: slugName, unique_code } = slug(name);

  const category = await Category.create({
    name,
    slug: slugName,
    image:image,
    unique_code,
    parent_id: null
  });

  return category;
};

// ✅ Insert Sub Category
export const InsertSubCategory = async ({ name, parent_id,image }) => {
  if (!name) throw new Error("Category name is required");
  const { slug: slugName, unique_code } = slug(name);
  const category = await Category.create({
    name,
    image:image|| null,
    slug: slugName,
    unique_code,
    parent_id,
  });

  return category;
};

// ✅ Get All Categories (by parent_id)
export const GetInfoFromCategoriesData = async (parent_id) => {
  const baseUrl = process.env.BASE_URL || "";

  const whereCondition =
    parent_id === "null" ? { parent_id: null,is_delete:false } : { parent_id,is_delete:false };

  const categories = await Category.findAll({
    where: whereCondition,
    order: [["priority", "ASC"]],
  });

  // Add image path dynamically
  return categories.map((cat) => ({
    ...cat.toJSON(),
    image: cat.image ? `${baseUrl}${cat.image}` : null,
  }));
};

// ✅ Only Sub Categories (direct children of root)
export const GetInfoOnlySubCategory = async () => {
  const baseUrl = process.env.BASE_URL || "";
  const subcategories = await Category.findAll({
    include: [
      {
        model: Category,
        as: "parent",
        where: { parent_id: null, is_delete: false },
      },
    ],
  });

  return subcategories.map((cat) => {
    const obj = cat.toJSON();

    return {
      ...obj,
      image: obj.image ? `${baseUrl}${obj.image}` : null,
      parent: obj.parent
        ? {
            ...obj.parent,
            image: obj.parent.image ? `${baseUrl}${obj.parent.image}` : null,
          }
        : null,
    };
  });
};

// ✅ Only Sub-Sub Categories
export const GetInfoOnlySubSubCategory = async () => {
  const baseUrl = process.env.BASE_URL || "";
  const subsubcategories = await Category.findAll({
    include: [
      {
        model: Category,
        as: "parent",
        where: { parent_id: { [Op.ne]: null }, is_delete: false },
      },
    ],
  });

  return subsubcategories.map((cat) => {
    const obj = cat.toJSON();

    return {
      ...obj,
      image: obj.image ? `${baseUrl}${obj.image}` : null,
      parent: obj.parent
        ? {
            ...obj.parent,
            image: obj.parent.image ? `${baseUrl}${obj.parent.image}` : null,
          }
        : null,
    };
  });
};


// ✅ Update Category
export const UpdateCategoryByID = async ({ id, name }) => {
  if (!id || !name) throw new Error("ID and Name are required");
  const { slug: slugName, unique_code } = slug(name);

  const [updated] = await Category.update(
    { name, slug: slugName, unique_code },
    { where: { id }, returning: true }
  );

  if (!updated) throw new Error("Category not found");

  return await Category.findByPk(id);
};

// ✅ Delete Category
export const DeleteCategoryByID = async (id) => {
  const category = await Category.findByPk(id);
  if (!category) {
    throw new Error("Category not found");
  }

  // Soft delete
  category.is_delete = true;
  await category.save();

  return category;
};


export const GetThreeLevelCategoriesData = async () => {
  const baseUrl = process.env.BASE_URL || "";

  const categories = await Category.findAll({
    where: { parent_id: null, is_delete: false }, // only main categories
    include: [
      {
        model: Category,
        as: "children",
        where: { is_delete: false },
        required: false,
        include: [
          {
            model: Category,
            as: "children",
            where: { is_delete: false },
            required: false,
          },
        ],
      },
    ],
    order: [["priority", "ASC"]],
  });

  // Format with full image URL and only id, name, image
  return categories.map((main) => ({
    id: main.id,
    name: main.name,
    image: main.image ? `${baseUrl}${main.image}` : "",
    children: main.children
      ? main.children
          .sort((a, b) => (a.priority || 0) - (b.priority || 0))
          .map((child) => ({
            id: child.id,
            name: child.name,
            image: child.image ? `${baseUrl}${child.image}` : "",
            children: child.children
              ? child.children
                  .sort((a, b) => (a.priority || 0) - (b.priority || 0))
                  .map((sub) => ({
                    id: sub.id,
                    name: sub.name,
                    image: sub.image ? `${baseUrl}${sub.image}` : "",
                  }))
              : [],
          }))
      : [],
  }));
};

export { Category };
