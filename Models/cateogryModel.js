import slugify from "slugify";
import Category from "../Schema/category.js";
import { Op } from "sequelize";

// Utility to generate slug & unique code
const slug = (name) => {
  if (!name || typeof name !== "string") throw new Error("slug name is required");
  return {
    slug: slugify(name, { lower: true }),
    unique_code: name.toUpperCase().replace(/[^A-Z0-9]+/g, "_"),
  };
};

// ----------------------------
// ✅ Create / Insert
// ----------------------------

// Insert main category
export const InsertMainCategory = async ({ name, image, priority }) => {
  if (!name) throw new Error("Category name is required");
  const { slug: slugName, unique_code } = slug(name);

  return Category.create({
    name,
    slug: slugName,
    image: image || null,
    unique_code,
    parent_id: null,
    priority: priority || null,
  });
};

// Insert subcategory with parent_name
export const InsertSubCategory = async ({ name, parent_id, image }) => {
  if (!name) throw new Error("Category name is required");
  const { slug: slugName, unique_code } = slug(name);

  const category = await Category.create({
    name,
    image: image || null,
    slug: slugName,
    unique_code,
    parent_id,
  });

  let parent_name = null;
  if (parent_id) {
    const parent = await Category.findByPk(parent_id);
    if (parent && !parent.is_delete) parent_name = parent.name;
  }

  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    unique_code: category.unique_code,
    parent_id: category.parent_id,
    parent_name,
    image: category.image || "",
  };
};

// ----------------------------
// ✅ Update Category
// ----------------------------
export const UpdateCategoryByID = async ({ id, name, parent_id, image }) => {
  if (!id || !name) throw new Error("ID and Name are required");

  const category = await Category.findByPk(id);
  if (!category) throw new Error("Category not found");

  const { slug: slugName, unique_code } = slug(name);

  const updatedData = {
    name,
    slug: slugName,
    unique_code,
    parent_id
  };

   if (image) {
    updatedData.image = image;
  }

  await Category.update(updatedData, { where: { id } });

  const updatedCategory = await Category.findByPk(id);

  let parent_name = null;
  if (updatedCategory.parent_id) {
    const parent = await Category.findByPk(updatedCategory.parent_id);
    if (parent && !parent.is_delete) parent_name = parent.name;
  }

  return {
    id: updatedCategory.id,
    name: updatedCategory.name,
    slug: updatedCategory.slug,
    unique_code: updatedCategory.unique_code,
    parent_id: updatedCategory.parent_id,
    parent_name,
    image: updatedCategory.image || "",
  };
};

// ----------------------------
// ✅ Delete Category
// ----------------------------
export const DeleteCategoryByID = async (id) => {
  const category = await Category.findByPk(id);
  if (!category) throw new Error("Category not found");

  // Soft delete
  category.is_delete = true;
  await category.save();

  let deleteType = "main";
  if (category.parent_id) {
    const parent = await Category.findByPk(category.parent_id);
    deleteType = parent?.parent_id ? "subsub" : "sub";
  }

  return {
    ...category.toJSON(),
    delete: deleteType,
  };
};

// ----------------------------
// ✅ Get Category by ID (with parent & grandparent)
// ----------------------------
export const GetCategoryByID = async (id) => {
  const category = await Category.findByPk(id);
  if (!category || category.is_delete) throw new Error("Category not found");

  const result = {
    id: category.id,
    name: category.name,
    parent_id: category.parent_id,
    image: category.image || "",
  };

  if (category.parent_id) {
    const parent = await Category.findByPk(category.parent_id);
    if (parent && !parent.is_delete) {
      result.parent = { id: parent.id, name: parent.name, image: parent.image || "" };

      if (parent.parent_id) {
        const main = await Category.findByPk(parent.parent_id);
        if (main && !main.is_delete) result.main = { id: main.id, name: main.name, image: main.image || "" };
      }
    }
  }

  return result;
};

// ----------------------------
// ✅ Get Three-Level Categories
// ----------------------------
export const GetThreeLevelCategoriesData = async () => {
  const categories = await Category.findAll({
    where: { parent_id: null, is_delete: false },
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

  // Map categories recursively
  const formatCategory = (cat) => ({
    id: cat.id,
    name: cat.name,
    image: cat.image || "",
    children: cat.children?.sort((a, b) => (a.priority || 0) - (b.priority || 0)).map(formatCategory) || [],
  });

  return categories.map(formatCategory);
};

// ----------------------------
// ✅ Generic Get Categories
// ----------------------------
export const GetInfoFromCategoriesData = async (parent_id) => {
  const whereCondition = parent_id === "null" ? { parent_id: null, is_delete: false } : { parent_id, is_delete: false };

  const categories = await Category.findAll({
    where: whereCondition,
    order: [["priority", "ASC"]],
  });

  return categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    priority: cat.priority,
    unique_code: cat.unique_code,
    parent_id: cat.parent_id,
    image: cat.image || "",
  }));
};

// ----------------------------
// ✅ Only Sub Categories
// ----------------------------
export const GetInfoOnlySubCategory = async () => {
  const subcategories = await Category.findAll({
    where: { is_delete: false },
    include: [{ model: Category, as: "parent", where: { parent_id: null, is_delete: false } }],
    order: [["priority", "ASC"]],
  });

  return subcategories.map((cat) => {
    const obj = cat.toJSON();
    return {
      id: obj.id,
      name: obj.name,
      slug: obj.slug,
      priority: obj.priority,
      unique_code: obj.unique_code,
      parent_id: obj.parent_id,
      image: obj.image || "",
      parent: obj.parent ? { id: obj.parent.id, name: obj.parent.name, image: obj.parent.image || "" } : null,
    };
  });
};

// ----------------------------
// ✅ Only Sub-Sub Categories
// ----------------------------
export const GetInfoOnlySubSubCategory = async () => {
  const subsubcategories = await Category.findAll({
    where: { is_delete: false },
    include: [{ model: Category, as: "parent", where: { parent_id: { [Op.ne]: null }, is_delete: false } }],
    order: [["priority", "ASC"]],
  });

  return subsubcategories.map((cat) => {
    const obj = cat.toJSON();
    return {
      id: obj.id,
      name: obj.name,
      slug: obj.slug,
      priority: obj.priority,
      unique_code: obj.unique_code,
      parent_id: obj.parent_id,
      image: obj.image || "",
      parent: obj.parent ? { id: obj.parent.id, name: obj.parent.name, image: obj.parent.image || "" } : null,
    };
  });
};

export { Category };
