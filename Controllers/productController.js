// Controllers/productController.js
import {
  Product,
  createProduct,
  updateProduct,
  deleteProduct,
  softDeleteProductVariantByAttribute,
} from "../Models/productModel.js";
import { ProductVariant } from "../Models/productVariantModel.js";
import { ProductVariantAttributeValue } from "../Models/ProductVariantAttributeValueModel.js";
import { ProductImage } from "../Models/productImageModel.js";
import { Attribute } from "../Models/attributeModel.js";
import { AttributeValue } from "../Models/attributeValueModel.js";
import { Wishlist } from "../Models/wishlistModel.js";
import { Category } from "../Models/cateogryModel.js";
import apiResponse from "../Helper/apiResponse.js";
import { Op,Sequelize } from "sequelize";
import appapiResponse from "../Helper/appapiResponse.js";

const normalizeNumber = (val, defaultVal = 0) => {
  if (val === undefined || val === null || val === "") return defaultVal;
  return Number(val);
};

export const addProduct = async (req, res) => {
  const t = await Product.sequelize.transaction();

  try {
    const {
      variants,
      stock,
      shipping_cost,
      selling_price,
      price,
      ...productData
    } = req.body;

    // ✅ 1. Create product
    const product = await Product.create(productData, { transaction: t });

    // ✅ 2. Save product-level images
    const productFiles = req.files.filter((f) => f.fieldname === "images");
    if (productFiles.length > 0) {
      const imageRecords = productFiles.map((f) => ({
        product_id: product.id,
        image_url: `/uploads/products/${f.filename}`,
      }));
      await ProductImage.bulkCreate(imageRecords, { transaction: t });
    }

    // ✅ 3. Parse variants
    let variantsArray = [];
    try {
      variantsArray =
        typeof variants === "string" ? JSON.parse(variants) : variants;
    } catch (err) {
      console.error("Failed to parse variants:", err);
      variantsArray = [];
    }

    if (variantsArray.length > 0) {
      for (let i = 0; i < variantsArray.length; i++) {
        const { attributes, ...variantInfo } = variantsArray[i];

        const sku = `SKU-${product.id}-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 6)
          .toUpperCase()}`;

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
          const pvavRecords = attributes.map((attr) => ({
            product_id: product.id,
            variant_id: variant.id,
            attribute_id: attr.attribute_id,
            attribute_value_id: attr.attribute_value_id,
          }));
          await ProductVariantAttributeValue.bulkCreate(pvavRecords, {
            transaction: t,
          });
        }

        // ✅ Variant images
        const variantFiles = req.files.filter(
          (f) => f.fieldname === `variant_${i}_image`
        );
        if (variantFiles.length > 0) {
          const variantImageRecords = variantFiles.map((f) => ({
            product_id: product.id,
            variant_id: variant.id,
            image_url: `/uploads/products/${f.filename}`,
          }));
          await ProductImage.bulkCreate(variantImageRecords, {
            transaction: t,
          });
        }
      }
    } else {
      // ✅ Simple product (no variants)
      const sku = `SKU-${product.id}-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase()}`;
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
    return apiResponse.successResponseWithData(
      res,
      "Product created with variants & images",
      product
    );
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

    // Filters
    const {
      type,
      brand,
      category_id,
      subcategory_id,
      childcategory_id,
      search,
    } = req.query;

    const decoded = req.user;
    const { id, role } = decoded || {};

    // Base condition
    let whereCondition = { is_deleted: false };

    // Product type filter (simple/variable)
    if (type) {
      whereCondition.product_type = type;
    }

    // ✅ Shop filter based on role
    if (role == 2 || role == 3) {
      whereCondition.shop_id = id; // only their shop’s products
    }

    // Brand filter (case-insensitive search)
    if (brand) {
      whereCondition.brand = {
        [Op.iLike]: `%${brand}%`,
      };
    }

    // 🔍 Name search filter
    if (search) {
      whereCondition.name = {
        [Op.iLike]: `%${search}%`,
      };
    }

    // Category filters
    if (category_id) {
      whereCondition.maincategory_id = category_id; // main category
    }
    if (subcategory_id) {
      whereCondition.subcategory_id = subcategory_id; // sub category
    }
    if (childcategory_id) {
      whereCondition.category_id = childcategory_id; // child category
    }

    // Fetch products
    const { count, rows: products } = await Product.findAndCountAll({
      where: { ...whereCondition },
      attributes: { exclude: ["createdAt", "updatedAt", "is_deleted"] },
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
          include: [
            {
              model: Category,
              as: "parent",
              attributes: ["id", "name"],
              include: [
                {
                  model: Category,
                  as: "parent",
                  attributes: ["id", "name"],
                },
              ],
            },
          ],
        },
        {
          model: ProductImage,
          as: "images",
          attributes: { exclude: ["createdAt", "updatedAt", "is_deleted"] },
        },
        {
          model: ProductVariant,
          as: "variants",
          where: { is_deleted: false },
          attributes: { exclude: ["createdAt", "updatedAt", "is_deleted"] },
          include: [
            {
              model: ProductVariantAttributeValue,
              as: "attributes",
              attributes: { exclude: ["createdAt", "updatedAt", "is_deleted"] },
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
      limit,
      offset,
      distinct: true,
      order: [["id", "DESC"]],
    });

    // Transform categories into main/sub/child
    const formattedProducts = products.map((p) => {
      const json = p.toJSON();

      const childCategory_name = json.category?.name || null;
      const subCategory_name = json.category?.parent?.name || null;
      const mainCategory_name = json.category?.parent?.parent?.name || null;

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
    console.error("Error in getAllProducts API:", err);
    return apiResponse.ErrorResponse(
      res,
      "Failed to fetch products: " + err.message
    );
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { id: req.params.id },
      attributes: { exclude: ["createdAt", "updatedAt", "is_deleted"] },
      include: [
        {
          model: ProductImage,
          as: "images",
          attributes: { exclude: ["createdAt", "updatedAt", "is_deleted"] },
        },
        {
          model: ProductVariant,
          as: "variants",
          where: { is_deleted: false },
          attributes: { exclude: ["createdAt", "updatedAt", "is_deleted"] },
          include: [
            {
              model: ProductVariantAttributeValue,
              as: "attributes",
              attributes: { exclude: ["createdAt", "updatedAt", "is_deleted"] },
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

    // ✅ Group attributes
    let attributes = {};
    product.variants.forEach((variant) => {
      variant.attributes.forEach((attr) => {
        const key = attr.attribute.id;

        if (!attributes[key]) {
          attributes[key] = [];
        }

        if (!attributes[key].some((a) => a.id === attr.attribute_value.id)) {
          attributes[key].push({
            id: attr.attribute_value.id,
            value: attr.attribute_value.value,
          });
        }
      });
    });

    // ✅ Combine product + attributes in response
    const responseData = {
      ...product.toJSON(),
      attributes,
    };

    responseData.variants = responseData.variants.map((variant) => {
      const values = variant.attributes.map(
        (attr) => attr.attribute_value.value
      );
      return {
        ...variant,
        attribute_variant_value: values.join("/"),
      };
    });

    return apiResponse.successResponseWithData(
      res,
      "Fetched product with variants & attributes successfully",
      responseData
    );
  } catch (err) {
    console.error("Error in getProductByIdAPI:", err);
    return apiResponse.ErrorResponse(
      res,
      "Failed to fetch product: " + err.message
    );
  }
};

export const updateProductById = async (req, res) => {
  const t = await Product.sequelize.transaction();

  try {
    const { id } = req.params;
    const {
      variants,
      image_ids_to_delete,
      stock,
      shipping_cost,
      selling_price,
      price,
      ...productData
    } = req.body;

    // 1️⃣ Find product
    const product = await Product.findByPk(id, { transaction: t });
    if (!product) {
      await t.rollback();
      return apiResponse.notFoundResponse(res, "Product not found", []);
    }

    // 2️⃣ Update product info
    await product.update(productData, { transaction: t });

    // 3️⃣ Delete selected images
    if (Array.isArray(image_ids_to_delete) && image_ids_to_delete.length > 0) {
      await ProductImage.destroy({
        where: { id: image_ids_to_delete, product_id: id },
        transaction: t,
      });
    }

    // 4️⃣ Add new product-level images (only files)
    const productFiles = (req.files || []).filter(
      (f) => f.fieldname === "images"
    );
    if (productFiles.length > 0) {
      const imageRecords = productFiles.map((f) => ({
        product_id: id,
        image_url: `/uploads/products/${f.filename}`,
      }));
      await ProductImage.bulkCreate(imageRecords, { transaction: t });
    }

    // 5️⃣ Parse variants
    let variantsArray = [];
    try {
      variantsArray =
        typeof variants === "string" ? JSON.parse(variants) : variants;
    } catch (err) {
      console.error("Failed to parse variants:", err);
      variantsArray = [];
    }

    if (Array.isArray(variantsArray) && variantsArray.length > 0) {
      // 🔄 Update or insert multiple variants
      for (let i = 0; i < variantsArray.length; i++) {
        const {
          id: variantId,
          attributes,
          sku,
          images: variantImages, // ignored if only URLs
          ...variantInfo
        } = variantsArray[i];
        let variant;

        if (variantId) {
          // 🔄 Update existing variant
          variant = await ProductVariant.findOne({
            where: { id: variantId, product_id: id },
            transaction: t,
          });

          if (variant) {
            await variant.update(
              {
                ...variantInfo,
                sku: sku || variant.sku,
                price: normalizeNumber(variantInfo.price, variant.price),
                selling_price: normalizeNumber(
                  variantInfo.selling_price,
                  variant.selling_price
                ),
                stock: normalizeNumber(variantInfo.stock, variant.stock),
                shipping_cost: normalizeNumber(
                  variantInfo.shipping_cost,
                  variant.shipping_cost
                ),
              },
              { transaction: t }
            );

            // 🔄 Update attributes
            if (attributes && attributes.length > 0) {
              await ProductVariantAttributeValue.destroy({
                where: { variant_id: variant.id },
                transaction: t,
              });

              const pvavRecords = attributes.map((attr) => ({
                product_id: id,
                variant_id: variant.id,
                attribute_id: attr.attribute_id || attr.attribute?.id,
                attribute_value_id: attr.attribute_value_id,
              }));

              await ProductVariantAttributeValue.bulkCreate(pvavRecords, {
                transaction: t,
              });
            }
          }
        } else {
          // ➕ Create new variant
          const newSku =
            sku ||
            `SKU-${id}-${Date.now()}-${Math.random()
              .toString(36)
              .substring(2, 6)
              .toUpperCase()}`;

          variant = await ProductVariant.create(
            {
              ...variantInfo,
              product_id: id,
              sku: newSku,
              price: normalizeNumber(variantInfo.price, 0.0),
              selling_price: normalizeNumber(variantInfo.selling_price, 0.0),
              stock: normalizeNumber(variantInfo.stock, 0),
              shipping_cost: normalizeNumber(variantInfo.shipping_cost, 0.0),
            },
            { transaction: t }
          );

          // ➕ Add attributes
          if (attributes && attributes.length > 0) {
            const pvavRecords = attributes.map((attr) => ({
              product_id: id,
              variant_id: variant.id,
              attribute_id: attr.attribute_id || attr.attribute?.id,
              attribute_value_id: attr.attribute_value_id,
            }));
            await ProductVariantAttributeValue.bulkCreate(pvavRecords, {
              transaction: t,
            });
          }
        }

        // 🔄 Handle variant images (only uploaded files, skip URLs)
        const variantFiles = (req.files || []).filter(
          (f) => f.fieldname === `variant_${i}_image`
        );

        if (variantFiles.length > 0) {
          const variantImageRecords = variantFiles.map((f) => ({
            product_id: id,
            variant_id: variant.id,
            image_url: `/uploads/products/${f.filename}`,
          }));
          await ProductImage.bulkCreate(variantImageRecords, {
            transaction: t,
          });
        }

        // ❌ Skip variantImages from body (URLs) — not inserted
      }
    } else {
      // 📌 Simple product case (update first variant)
      const firstVariant = await ProductVariant.findOne({
        where: { product_id: id },
        order: [["id", "ASC"]],
        transaction: t,
      });

      if (firstVariant) {
        await firstVariant.update(
          {
            price: normalizeNumber(price, firstVariant.price),
            selling_price: normalizeNumber(
              selling_price,
              firstVariant.selling_price
            ),
            stock: normalizeNumber(stock, firstVariant.stock),
            shipping_cost: normalizeNumber(
              shipping_cost,
              firstVariant.shipping_cost
            ),
          },
          { transaction: t }
        );
      }
    }

    // ✅ Commit transaction
    await t.commit();

    // 6️⃣ Fetch updated product with relations
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
            { model: ProductImage, as: "variant_images" },
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
    if (!t.finished) {
      await t.rollback();
    }
    console.error("Update product error:", err);
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
    const userId = req.user?.id || null;

    const page = parseInt(req.body.page) || 1;
    const limit = parseInt(req.body.limit) || 10;
    const offset = (page - 1) * limit;

    const { maincategory_id, subcategory_id, childcategory_id, search } = req.body;

    const whereCondition = { is_deleted: false };

    if (maincategory_id) whereCondition.maincategory_id = maincategory_id;
    if (subcategory_id) whereCondition.subcategory_id = subcategory_id;
    if (childcategory_id) whereCondition.category_id = childcategory_id;

    if (search && search.trim() !== "") {
      whereCondition[Op.or] = [{ name: { [Op.like]: `%${search}%` } }];
    }

    // ✅ Get wishlist product IDs
    let wishlistProductIds = [];
    if (userId) {
      const wishlistItems = await Wishlist.findAll({
        where: { user_id: userId },
        attributes: ["product_id"],
      });
      wishlistProductIds = wishlistItems.map((w) => w.product_id);
    }

    // ✅ Fetch products
    const { count, rows: products } = await Product.findAndCountAll({
      where: whereCondition,
      attributes: [
        "id",
        "name",
        "description",
        "product_type",
        "maincategory_id",
        "subcategory_id",
        "category_id",
      ],
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
          order: [["id", "ASC"]], // ✅ Order variants ascending
        },
      ],
      limit,
      offset,
      distinct: true,
      order: [["id", "ASC"]], // ✅ Order products ascending
    });

    // ✅ Format output with discount
    const formattedProducts = products.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      product_type: p.product_type,
      maincategory_id: p.maincategory_id,
      subcategory_id: p.subcategory_id,
      childcategory_id: p.category_id,
      is_wishlist: userId ? wishlistProductIds.includes(p.id) : false,
      thumbnail:
        p.images.find((img) => img.is_primary)?.image_url ||
        p.images[0]?.image_url ||
        null,
      gallery: p.images.map((img) => img.image_url),
      variants: p.variants.map((v) => {
        // ✅ Calculate discount
        const discount =
          v.price > 0
            ? Math.round(((v.price - v.selling_price) / v.price) * 100)
            : 0;

        return {
          id: v.id,
          sku: v.sku,
          price: Number(v.price),
          selling_price: Number(v.selling_price),
          shipping_cost: Number(v.shipping_cost),
          stock: v.stock,
          is_default: v.is_default,
          discount, // ✅ Added discount field
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
        };
      }),
    }));

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


export const removeAttributeInProduct = async (req, res) => {
  try {
    const { product_id, attribute_value_id } = req.body;

    if (!product_id || !attribute_value_id) {
      return apiResponse.ErrorResponse(
        res,
        "product_id and attribute_value_id are required"
      );
    }

    const deleted = await softDeleteProductVariantByAttribute(
      product_id,
      attribute_value_id
    );

    if (!deleted || deleted[0] === 0) {
      return apiResponse.notFoundResponse(
        res,
        "No matching product variant found",
        []
      );
    }

    return apiResponse.successResponseWithData(
      res,
      "Product variant soft deleted successfully",
      deleted
    );
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

export const getRandomProducts = async (req, res) => {
  try {
    const userId = req.user?.id || null; // from optionalAuthCookie

    const products = await Product.findAll({
      where: { is_deleted: false },
      include: [
        {
          model: ProductVariant,
          as: "variants",
          required: false,
          where: { is_deleted: false },
          limit: 1,
        },
        {
          model: ProductImage,
          as: "images",
          required: false,
          where: { is_deleted: false },
        },
      ],
      limit: 10,
      order: Sequelize.literal("RANDOM()"), // ✅ random
    });

    if (!products || products.length === 0) {
      return apiResponse.notFoundResponse(res, "No products found", []);
    }

    // Fetch wishlist product IDs for this user
    let wishlistProductIds = [];
    if (userId) {
      const wishlistItems = await Wishlist.findAll({
        where: { user_id: userId },
        attributes: ["product_id"],
      });
      wishlistProductIds = wishlistItems.map((w) => w.product_id);
    }

    const response = products.map((product) => {
      const variant = product.variants?.[0];
      const primaryImage =
        product.images?.find((img) => img.is_primary) || product.images?.[0];

      return {
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: variant ? Number(variant.selling_price) : 0,
        originalPrice: variant ? Number(variant.price) : 0,
        discount: variant
          ? Math.round(
              ((variant.price - variant.selling_price) / variant.price) * 100
            )
          : 0,
        image: primaryImage ? primaryImage.image_url : null,
        rating: 0,
        reviews: 0,
        is_wishlist: userId ? wishlistProductIds.includes(product.id) : false,
      };
    });

    return apiResponse.successResponseWithData(
      res,
      "Random products fetched successfully",
      response
    );
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

export const getTopRatedProducts = async (req, res) => {
  try {
    const userId = req.user?.id || null; // from optionalAuthCookie

    const products = await Product.findAll({
      where: { is_deleted: false },
      include: [
        {
          model: ProductVariant,
          as: "variants",
          required: false,
          where: { is_deleted: false },
          limit: 1,
        },
        {
          model: ProductImage,
          as: "images",
          required: false,
          where: { is_deleted: false },
        },
      ],
      limit: 10,
      order: Sequelize.literal("RANDOM()"),
    });

    if (!products || products.length === 0) {
      return apiResponse.notFoundResponse(res, "No products found", []);
    }

    // Fetch wishlist product IDs
    let wishlistProductIds = [];
    if (userId) {
      const wishlistItems = await Wishlist.findAll({
        where: { user_id: userId },
        attributes: ["product_id"],
      });
      wishlistProductIds = wishlistItems.map((w) => w.product_id);
    }

    const response = products.map((product) => {
      const variant = product.variants?.[0];
      const primaryImage =
        product.images?.find((img) => img.is_primary) || product.images?.[0];

      return {
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: variant ? Number(variant.selling_price) : 0,
        originalPrice: variant ? Number(variant.price) : 0,
        discount: variant
          ? Math.round(
              ((variant.price - variant.selling_price) / variant.price) * 100
            )
          : 0,
        image: primaryImage ? primaryImage.image_url : null,
        rating: 0,
        reviews: 0,
        is_wishlist: userId ? wishlistProductIds.includes(product.id) : false,
      };
    });

    return apiResponse.successResponseWithData(
      res,
      "Top rated products fetched successfully",
      response
    );
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

export const getWebAllProducts = async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const page = parseInt(req.body.page) || 1;
    const limit = parseInt(req.body.limit) || 10;
    const offset = (page - 1) * limit;

    const { main, sub, child, search } = req.body; // 🔹 Added search param

    let mainCategoryId = null,
      subCategoryId = null,
      childCategoryId = null;

    // 🔹 Resolve slugs to IDs
    if (main) {
      const mainCat = await Category.findOne({
        where: { slug: main, is_delete: false },
        attributes: ["id"],
      });
      if (!mainCat)
        return apiResponse.notFoundResponse(res, "Invalid main slug", []);
      mainCategoryId = mainCat.id;
    }

    if (sub) {
      const subCat = await Category.findOne({
        where: { slug: sub, is_delete: false },
        attributes: ["id"],
      });
      if (!subCat)
        return apiResponse.notFoundResponse(res, "Invalid sub slug", []);
      subCategoryId = subCat.id;
    }

    if (child) {
      const childCat = await Category.findOne({
        where: { slug: child, is_delete: false },
        attributes: ["id"],
      });
      if (!childCat)
        return apiResponse.notFoundResponse(res, "Invalid child slug", []);
      childCategoryId = childCat.id;
    }

    // 🔹 Build product query dynamically
    const whereCondition = { is_deleted: false };

    // Category filters
    if (childCategoryId) {
      whereCondition.category_id = childCategoryId;
    } else if (subCategoryId) {
      whereCondition.subcategory_id = subCategoryId;
    } else if (mainCategoryId) {
      whereCondition.maincategory_id = mainCategoryId;
    }

    // 🔹 Search by product name (case-insensitive)
    if (search && search.trim() !== "") {
      whereCondition.name = { [Op.like]: `%${search.trim()}%` };
    }

    // 🔹 Fetch products with variants & images
    const { count, rows: products } = await Product.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: ProductVariant,
          as: "variants",
          required: false,
          where: { is_deleted: false },
          limit: 1,
        },
        {
          model: ProductImage,
          as: "images",
          required: false,
          where: { is_deleted: false },
        },
      ],
      distinct: true,
      offset,
      limit,
      order: [["createdAt", "DESC"]],
    });

    if (!products || products.length === 0)
      return apiResponse.notFoundResponse(res, "No products found", []);

    // 🔹 Wishlist check
    let wishlistProductIds = [];
    if (userId) {
      const wishlistItems = await Wishlist.findAll({
        where: { user_id: userId },
        attributes: ["product_id"],
      });
      wishlistProductIds = wishlistItems.map((w) => w.product_id);
    }

    // 🔹 Format product data
    const response = products.map((product) => {
      const variant = product.variants?.[0];
      const primaryImage =
        product.images?.find((img) => img.is_primary) || product.images?.[0];

      return {
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: variant ? Number(variant.selling_price) : 0,
        originalPrice: variant ? Number(variant.price) : 0,
        discount: variant
          ? Math.round(
              ((variant.price - variant.selling_price) / variant.price) * 100
            )
          : 0,
        image: primaryImage ? primaryImage.image_url : null,
        rating: 0,
        reviews: 0,
        is_wishlist: userId ? wishlistProductIds.includes(product.id) : false,
      };
    });

    return apiResponse.successResponseWithData(
      res,
      "Products fetched successfully",
      response,
      { total: count, page, limit }
    );
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

export const getSimilarProducts = async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const { product_id, category_id, limit = 10 } = req.body;

    if (!category_id) {
      return apiResponse.notFoundResponse(res, "category_id is required", []);
    }

    // 🔹 Fetch products in the same category excluding the current product
    const products = await Product.findAll({
      where: {
        is_deleted: false,
        category_id: category_id,
        id: { [Op.ne]: product_id }, // Exclude current product
      },
      include: [
        {
          model: ProductVariant,
          as: "variants",
          required: false,
          where: { is_deleted: false },
          limit: 1,
        },
        {
          model: ProductImage,
          as: "images",
          required: false,
          where: { is_deleted: false },
        },
      ],
      limit,
      order: [["createdAt", "DESC"]],
    });

    if (!products || products.length === 0)
      return apiResponse.notFoundResponse(res, "No similar products found", []);

    // 🔹 Wishlist check
    let wishlistProductIds = [];
    if (userId) {
      const wishlistItems = await Wishlist.findAll({
        where: { user_id: userId },
        attributes: ["product_id"],
      });
      wishlistProductIds = wishlistItems.map((w) => w.product_id);
    }

    // 🔹 Format product data
    const response = products.map((product) => {
      const variant = product.variants?.[0];
      const primaryImage =
        product.images?.find((img) => img.is_primary) || product.images?.[0];

      return {
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: variant ? Number(variant.selling_price) : 0,
        originalPrice: variant ? Number(variant.price) : 0,
        discount: variant
          ? Math.round(
              ((variant.price - variant.selling_price) / variant.price) * 100
            )
          : 0,
        image: primaryImage ? primaryImage.image_url : null,
        rating: 0,
        reviews: 0,
        is_wishlist: userId ? wishlistProductIds.includes(product.id) : false,
      };
    });

    return apiResponse.successResponseWithData(
      res,
      "Similar products fetched successfully",
      response
    );
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// export const getProductDetails = async (req, res) => {
//   try {
//     const userId = req.user?.id || null;
//     const product_id = req.params.id;

//     if (!product_id) {
//       return apiResponse.notFoundResponse(res, "product_id is required", []);
//     }

//     // 🔹 Fetch product with variants + attributes + images
//     const product = await Product.findOne({
//       where: { id: product_id, is_deleted: false },
//       include: [
//         {
//           model: ProductVariant,
//           as: "variants",
//           required: false,
//           where: { is_deleted: false },
//           include: [
//             {
//               model: ProductVariantAttributeValue,
//               as: "attributes",
//               include: [
//                 {
//                   model: Attribute,
//                   as: "attribute",
//                   attributes: ["id", "name"],
//                 },
//                 {
//                   model: AttributeValue,
//                   as: "attribute_value",
//                   attributes: ["id", "value"],
//                 },
//               ],
//             },
//           ],
//         },
//         {
//           model: ProductImage,
//           as: "images",
//           required: false,
//           where: { is_deleted: false },
//         },
//       ],
//     });

//     if (!product) {
//       return apiResponse.notFoundResponse(res, "Product not found", []);
//     }

//     // 🔹 Wishlist
//     const isWishlist = userId
//       ? !!(await Wishlist.findOne({
//           where: { user_id: userId, product_id: product.id },
//         }))
//       : false;

//     // 🔹 Format images
//     const images = product.images?.map((img) => img.image_url) || [];

//     // 🔹 Format variants + attributes
//     const variants =
//       product.variants?.map((variant) => {
//         const attrs = {};

//         variant.attributes?.forEach((attr) => {
//   const name = attr.attribute?.name || "";
//   const value = attr.attribute_value?.value || ""; // ✅ match alias
//   if (name && value) attrs[name] = value;
// });

//         return {
//           id: variant.id,
//           price: Number(variant.selling_price),
//           oldPrice: Number(variant.price),
//           attributes: attrs,
//           stock: variant.stock || 0,
//         };
//       }) || [];

//     // 🔹 Mock reviews (or from Review model)
//     const reviewData = [
//       { name: "Riya Sharma", rating: 4, comment: "Great quality and fit! Loved the fabric." },
//       { name: "Anjali Mehta", rating: 5, comment: "Perfect for festive occasions. Highly recommend!" },
//       { name: "Neha Verma", rating: 5, comment: "Stylish and comfy. Will buy again!" },
//       { name: "Priya Singh", rating: 3, comment: "Looks nice but slightly tight." },
//       { name: "Meena Joshi", rating: 4, comment: "Very soft and elegant fabric. Happy with it." },
//     ];

//     // 🔹 Final response
//     const response = {
//       id: product.id,
//       title: product.name,
//       description: product.description || "",
//       availability: product.status || "In Stock",
//       images,
//       variants,
//       is_wishlist: isWishlist,
//       reviews: reviewData,
//     };

//     return apiResponse.successResponseWithData(
//       res,
//       "Product details fetched successfully",
//       response
//     );
//   } catch (err) {
//     console.error("getProductDetails error:", err);
//     return apiResponse.ErrorResponse(res, err.message);
//   }
// };

export const getProductDetails = async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const productId = req.params.id; // product id from URL param

    if (!productId) {
      return apiResponse.ErrorResponse(res, "Product ID is required");
    }

    // ✅ Get wishlist product IDs for logged-in user
    let wishlistProductIds = [];
    if (userId) {
      const wishlistItems = await Wishlist.findAll({
        where: { user_id: userId },
        attributes: ["product_id"],
      });
      wishlistProductIds = wishlistItems.map((w) => w.product_id);
    }

    // ✅ Fetch single product with full details
    const product = await Product.findOne({
      where: { id: productId, is_deleted: false },
      attributes: ["id", "name", "description", "product_type"],
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
    });

    if (!product) {
      return apiResponse.ErrorResponse(res, "Product not found");
    }

    const reviewData = [
      { name: "Riya Sharma", rating: 4, comment: "Great quality and fit! Loved the fabric." },
      { name: "Anjali Mehta", rating: 5, comment: "Perfect for festive occasions. Highly recommend!" },
      { name: "Neha Verma", rating: 5, comment: "Stylish and comfy. Will buy again!" },
      { name: "Priya Singh", rating: 3, comment: "Looks nice but slightly tight." },
      { name: "Meena Joshi", rating: 4, comment: "Very soft and elegant fabric. Happy with it." },
    ];

    // ✅ Transform single product data (same format as list)
    const formattedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      product_type: product.product_type,
      is_wishlist: userId ? wishlistProductIds.includes(product.id) : false,
      thumbnail:
        product.images.find((img) => img.is_primary)?.image_url ||
        product.images[0]?.image_url ||
        null,
      gallery: product.images.map((img) => img.image_url),
      variants: product.variants.map((v) => ({
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
      reviews:reviewData
    };

    return apiResponse.successResponseWithData(
      res,
      "Product fetched successfully",
      formattedProduct
    );
  } catch (error) {
    return apiResponse.ErrorResponse(res, error.message);
  }
};










