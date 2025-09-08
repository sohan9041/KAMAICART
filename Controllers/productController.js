// Controllers/productController.js
import {
  Product,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../Models/productModel.js";
import { ProductVariant } from "../Models/productVariantModel.js";
import { ProductVariantAttributeValue } from "../Models/ProductVariantAttributeValueModel.js";
import { ProductImage } from "../Models/productImageModel.js";
import { Attribute } from "../Models/attributeModel.js";
import { AttributeValue } from "../Models/attributeValueModel.js";
import { Wishlist } from "../Models/wishlistModel.js";
import { Category } from "../Models/cateogryModel.js";
import apiResponse from "../Helper/apiResponse.js";

import appapiResponse from "../Helper/appapiResponse.js";

const normalizeNumber = (val, defaultVal = 0) => {
  if (val === undefined || val === null || val === "") return defaultVal;
  return Number(val);
};

export const addProduct = async (req, res) => {
  const t = await Product.sequelize.transaction();

  try {
    const { variants, stock, shipping_cost, selling_price, price, ...productData } = req.body;

    // ✅ 1. Create product
    const product = await Product.create(productData, { transaction: t });

    // ✅ 2. Save product-level images
    const productFiles = req.files.filter(f => f.fieldname === "images");
    if (productFiles.length > 0) {
      const imageRecords = productFiles.map(f => ({
        product_id: product.id,
        image_url: `/uploads/products/${f.filename}`,
      }));
      await ProductImage.bulkCreate(imageRecords, { transaction: t });
    }

    // ✅ 3. Parse variants
    let variantsArray = [];
    try {
      variantsArray = typeof variants === "string" ? JSON.parse(variants) : variants;
    } catch (err) {
      console.error("Failed to parse variants:", err);
      variantsArray = [];
    }

    if (variantsArray.length > 0) {
      for (let i = 0; i < variantsArray.length; i++) {
        const { attributes, ...variantInfo } = variantsArray[i];

        const sku = `SKU-${product.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        const variant = await ProductVariant.create(
          {
            ...variantInfo,
            product_id: product.id,
            sku,
            price: normalizeNumber(variantInfo.price, 0.0),
            selling_price: normalizeNumber(variantInfo.selling_price, 0.0),
            stock: normalizeNumber(variantInfo.stock, 0),
            shipping_cost: normalizeNumber(variantInfo.shipping_cost, 0.0),
          },
          { transaction: t }
        );

        // ✅ Variant attributes
        if (attributes && attributes.length > 0) {
          const pvavRecords = attributes.map(attr => ({
            product_id: product.id,
            variant_id: variant.id,
            attribute_id: attr.attribute_id,
            attribute_value_id: attr.attribute_value_id,
          }));
          await ProductVariantAttributeValue.bulkCreate(pvavRecords, { transaction: t });
        }

        // ✅ Variant images
        const variantFiles = req.files.filter(f => f.fieldname === `variant_${i}_image`);
        if (variantFiles.length > 0) {
          const variantImageRecords = variantFiles.map(f => ({
            product_id: product.id,
            variant_id: variant.id,
            image_url: `/uploads/products/${f.filename}`,
          }));
          await ProductImage.bulkCreate(variantImageRecords, { transaction: t });
        }
      }
    } else {
      // ✅ Simple product (no variants)
      const sku = `SKU-${product.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      await ProductVariant.create(
        {
          product_id: product.id,
          stock: normalizeNumber(stock, 0),
          shipping_cost: normalizeNumber(shipping_cost, 0.0),
          selling_price: normalizeNumber(selling_price, 0.0),
          price: normalizeNumber(price, 0.0),
          is_default: true,
          sku,
        },
        { transaction: t }
      );
    }

    await t.commit();
    return apiResponse.successResponseWithData(res, "Product created with variants & images", product);

  } catch (err) {
    await t.rollback();
    console.error(err);
    return apiResponse.ErrorResponse(res, err.message);
  }
};

export const getAllProducts = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Fetch with categories + variants + images
    const { count, rows: products } = await Product.findAndCountAll({
      where: { is_deleted: false },
      include: [
        {
          model: Category,
          as: "category", // 🔑 must match association
          attributes: ["id", "name"],
          include: [
            {
              model: Category,
              as: "parent", // subCategory
              attributes: ["id", "name"],
              include: [
                {
                  model: Category,
                  as: "parent", // mainCategory
                  attributes: ["id", "name"],
                },
              ],
            },
          ],
        },
        { model: ProductImage, as: "images" },
        {
          model: ProductVariant,
          as: "variants",
          include: [
            {
              model: ProductVariantAttributeValue,
              as: "attributes",
              include: [
                { model: Attribute, as: "attribute", attributes: ["id", "name", "input_type"] },
                { model: AttributeValue, as: "attribute_value", attributes: ["id", "value"] },
              ],
            },
          ],
        },
      ],
      limit,
      offset,
      distinct: true,
      order: [["createdAt", "DESC"]],
    });

    // Transform categories into main/sub/child
    const formattedProducts = products.map((p) => {
  const json = p.toJSON();

  // Extract names
  const childCategory_name = json.category?.name || null;
  const subCategory_name = json.category?.parent?.name || null;
  const mainCategory_name = json.category?.parent?.parent?.name || null;

  // Delete category from response
  delete json.category;

  return {
    ...json,
    childCategory_name,
    subCategory_name,
    mainCategory_name,
  };
});

    return apiResponse.successResponseWithData(
      res,
      "Fetched products successfully",
      formattedProducts,
      {
        totalItems: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        pageSize: limit,
      }
    );
  } catch (err) {
    console.error("Error in getAllProductsAPI:", err);
    return apiResponse.ErrorResponse(res, "Failed to fetch products: " + err.message);
  }
};


export const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { id: req.params.id },
      include: [
        { model: ProductImage, as: "images" },
        {
          model: ProductVariant,
          as: "variants",
          include: [
            {
              model: ProductVariantAttributeValue,
              as: "attributes",
              include: [
                {
                  model: Attribute,
                  as: "attribute",
                  attributes: ["id", "name", "input_type"],
                },
                {
                  model: AttributeValue,
                  as: "attribute_value",
                  attributes: ["id", "value"],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!product) {
      return apiResponse.notFoundResponse(res, "Product not found", []);
    }

    return apiResponse.successResponseWithData(
      res,
      "Fetched product with variants & attributes successfully",
      product
    );
  } catch (err) {
    console.error("Error in getProductByIdAPI:", err);

    return apiResponse.ErrorResponse(
      res,
      "Failed to fetch product: " + err.message
    );
  }
};

// ✅ Update Product
export const updateProductById = async (req, res) => {
  const t = await Product.sequelize.transaction();

  try {
    const { id } = req.params;
    const { variants, image_ids_to_delete, ...productData } = req.body;

    // 1️⃣ Find product
    const product = await Product.findByPk(id, { transaction: t });
    if (!product)
      return apiResponse.notFoundResponse(res, "Product not found", []);

    // 2️⃣ Update product info
    await product.update(productData, { transaction: t });

    // 3️⃣ Delete selected images
    if (Array.isArray(image_ids_to_delete) && image_ids_to_delete.length > 0) {
      await ProductImage.destroy({
        where: { id: image_ids_to_delete, product_id: id },
        transaction: t,
      });
    }

    // 4️⃣ Add new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => ({
        product_id: id,
        image_url: `/uploads/products/${file.filename}`,
      }));
      await ProductImage.bulkCreate(newImages, { transaction: t });
    }

    // 5️⃣ Update or create variants
    if (Array.isArray(variants) && variants.length > 0) {
      for (const variantData of variants) {
        const { id: variantId, attributes, sku, ...variantInfo } = variantData;
        let variant;

        if (variantId) {
          variant = await ProductVariant.findOne({
            where: { id: variantId, product_id: id },
            transaction: t,
          });
          if (variant) {
            // ✅ Only check other variants for duplicate SKU
            if (sku && sku !== variant.sku) {
              const existingSku = await ProductVariant.findOne({
                where: { sku, id: { [Op.ne]: variantId } },
                transaction: t,
              });
              if (existingSku) {
                throw new Error(
                  `SKU "${sku}" already exists. Please choose a different SKU.`
                );
              }
            }
            await variant.update({ ...variantInfo, sku }, { transaction: t });
          }
        } else {
          // New variant: check SKU
          const existingSku = await ProductVariant.findOne({
            where: { sku },
            transaction: t,
          });
          if (existingSku) {
            throw new Error(
              `SKU "${sku}" already exists. Please choose a different SKU.`
            );
          }
          variant = await ProductVariant.create(
            { ...variantInfo, sku, product_id: id },
            { transaction: t }
          );
        }

        // ✅ Update attributes only if provided
        if (Array.isArray(attributes) && attributes.length > 0) {
          await ProductVariantAttributeValue.destroy({
            where: { variant_id: variant.id },
            transaction: t,
          });

          const pvavRecords = attributes.map((attr) => ({
            product_id: id,
            variant_id: variant.id,
            attribute_id: attr.attribute_id,
            attribute_value_id: attr.attribute_value_id,
          }));

          await ProductVariantAttributeValue.bulkCreate(pvavRecords, {
            transaction: t,
          });
        }
      }
    }

    await t.commit();

    // 6️⃣ Fetch updated product with full relations
    const updatedProduct = await Product.findOne({
      where: { id },
      include: [
        { model: ProductImage, as: "images" },
        {
          model: ProductVariant,
          as: "variants",
          include: [
            {
              model: ProductVariantAttributeValue,
              as: "attributes",
              include: [
                {
                  model: Attribute,
                  as: "attribute",
                  attributes: ["id", "name", "input_type"],
                },
                {
                  model: AttributeValue,
                  as: "attribute_value",
                  attributes: ["id", "value"],
                },
              ],
            },
          ],
        },
      ],
    });

    return apiResponse.successResponseWithData(
      res,
      "Product updated successfully",
      updatedProduct
    );
  } catch (err) {
    await t.rollback();

    if (err.name === "SequelizeUniqueConstraintError") {
      return apiResponse.ErrorResponse(
        res,
        `SKU already exists. Please choose a different SKU.`
      );
    }

    return apiResponse.ErrorResponse(res, err.message);
  }
};

// ✅ Soft Delete Product
export const deleteProductById = async (req, res) => {
  try {
    const deleted = await deleteProduct(req.params.id);
    if (!deleted)
      return apiResponse.notFoundResponse(res, "Product not found", []);
    return apiResponse.successResponseWithData(res, "Deleted successfully");
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

export const getAppProductList = async (req, res) => {
  try {
    // ✅ Logged-in user ID (from auth middleware or query param)
    const userId = req.user?.id || null;
console.log(req.user?.id);
    // Pagination params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // ✅ Get user wishlist product_ids only if logged in
    let wishlistProductIds = [];
    if (userId) {
      const wishlistItems = await Wishlist.findAll({
        where: { user_id: userId },
        attributes: ["product_id"],
      });
      wishlistProductIds = wishlistItems.map((w) => w.product_id);
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where: { is_deleted: false },
      attributes: ["id", "name"],
      include: [
        {
          model: ProductImage,
          as: "images",
          where: { is_deleted: false },
          required: false,
          attributes: ["id", "image_url", "variant_id", "is_primary"],
        },
        {
          model: ProductVariant,
          as: "variants",
          where: { is_deleted: false },
          required: false,
          attributes: [
            "id",
            "sku",
            "price",
            "stock",
            "is_default",
            "shipping_cost",
            "selling_price",
          ],
          include: [
            {
              model: ProductVariantAttributeValue,
              as: "attributes",
              include: [
                {
                  model: Attribute,
                  as: "attribute",
                  attributes: ["id", "name", "input_type"],
                },
                {
                  model: AttributeValue,
                  as: "attribute_value",
                  attributes: ["id", "value"],
                },
              ],
            },
            {
              model: ProductImage,
              as: "variant_images",
              where: { is_deleted: false },
              required: false,
              attributes: ["id", "image_url", "is_primary"],
            },
          ],
        },
      ],
      limit,
      offset,
      distinct: true,
      order: [["id", "DESC"]],
    });

    // ✅ Transform response for app
    const formattedProducts = products.map((p) => ({
      id: p.id,
      name: p.name,
      is_wishlist: userId ? wishlistProductIds.includes(p.id) : false, // ✅ false if not logged in
      thumbnail:
        p.images.find((img) => img.is_primary)?.image_url ||
        p.images[0]?.image_url ||
        null,
      gallery: p.images.map((img) => img.image_url),
      variants: p.variants.map((v) => ({
        id: v.id,
        sku: v.sku,
        price: v.price,
        selling_price: v.selling_price,
        shipping_cost: v.shipping_cost,
        stock: v.stock,
        is_default: v.is_default,
        attributes: v.attributes.map((attr) => ({
          attribute_id: attr.attribute.id,
          attribute_name: attr.attribute.name,
          value_id: attr.attribute_value.id,
          value: attr.attribute_value.value,
        })),
        images: v.variant_images.map((vi) => ({
          id: vi.id,
          url: vi.image_url,
          is_primary: vi.is_primary,
        })),
      })),
    }));

    // ✅ Pagination metadata
    const totalPages = Math.ceil(count / limit);

    return appapiResponse.successResponseWithData(
      res,
      "Product list fetched successfully",
      formattedProducts,
      {
        total: count,
        page,
        limit,
        totalPages,
      }
    );
  } catch (error) {
    return appapiResponse.ErrorResponse(res, error.message);
  }
};
