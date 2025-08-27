import slugify from "slugify";
import Category from "../Schema/category.js";

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
export const InsertSubCategory = async ({ name, parent_id }) => {
  if (!name) throw new Error("Category name is required");
  const { slug: slugName, unique_code,image } = slug(name);

  const category = await Category.create({
    name,
    image:image,
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
    order: [["id", "ASC"]],
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
  const subcategories= await Category.findAll({
    include: [{
      model: Category,
      as: "parent",
      where: { parent_id: null,is_delete:false },
    }],
  });

   return subcategories.map((cat) => ({
    ...cat.toJSON(),
    image: cat.image ? `${baseUrl}${cat.image}` : null,
  }));
};

// ✅ Only Sub-Sub Categories
export const GetInfoOnlySubSubCategory = async () => {
  const baseUrl = process.env.BASE_URL || "";
   const subsubcategories=  await Category.findAll({
    include: [{
      model: Category,
      as: "parent",
      where: { parent_id: { [Op.ne]: null },is_delete:false },
    }],
  });

  return subsubcategories.map((cat) => ({
    ...cat.toJSON(),
    image: cat.image ? `${baseUrl}${cat.image}` : null,
  }));
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


export { Category };
