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
import { Op } from "sequelize";

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

// export const getProductById = async (req, res) => {
//   try {
//     const product = await Product.findOne({
//       where: { id: req.params.id },
//       include: [
//         { model: ProductImage, as: "images" },
//         {
//           model: ProductVariant,
//           as: "variants",
//           include: [
//             {
//               model: ProductVariantAttributeValue,
//               as: "attributes",
//               include: [
//                 {
//                   model: Attribute,
//                   as: "attribute",
//                   attributes: ["id", "name", "input_type"],
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
//       ],
//     });
//     let attributes = {};
//     product.variants.forEach(variant => {
//       variant.attributes.forEach(attr => {
//       const key = attr.attribute.name; // e.g. "color" or "size"

//       if (!attributes[key]) {
//         attributes[key] = [];
//       }

//       // avoid duplicates
//       if (!attributes[key].some(a => a.id === attr.attribute_value.id)) {
//         attributes[key].push({
//           id: attr.attribute_value.id,
//           value: attr.attribute_value.value,
//           image: attr.attribute_value.image || null, // include image if exists
//         });
//       }
//     });
//   });

//     if (!product) {
//       return apiResponse.notFoundResponse(res, "Product not found", []);
//     }

//     return apiResponse.successResponseWithData(
//       res,
//       "Fetched product with variants & attributes successfully",
//       product
//     );
//   } catch (err) {
//     console.error("Error in getProductByIdAPI:", err);

//     return apiResponse.ErrorResponse(
//       res,
//       "Failed to fetch product: " + err.message
//     );
//   }
// };

// ✅ Update Product
// export const updateProductById = async (req, res) => {
//   const t = await Product.sequelize.transaction();

//   try {
//     const { id } = req.params;
//     const { variants, image_ids_to_delete, stock, shipping_cost, selling_price, price, ...productData } = req.body;

//     // 1️⃣ Find product
//     const product = await Product.findByPk(id, { transaction: t });
//     if (!product) {
//       await t.rollback();
//       return apiResponse.notFoundResponse(res, "Product not found", []);
//     }

//     // 2️⃣ Update product info (only product-level fields)
//     await product.update(productData, { transaction: t });

//     // 3️⃣ Delete selected images
//     if (Array.isArray(image_ids_to_delete) && image_ids_to_delete.length > 0) {
//       await ProductImage.destroy({
//         where: { id: image_ids_to_delete, product_id: id },
//         transaction: t,
//       });
//     }

//     // 4️⃣ Add new product-level images
//     const productFiles = (req.files || []).filter(f => f.fieldname === "images");
//     if (productFiles.length > 0) {
//       const imageRecords = productFiles.map(f => ({
//         product_id: id,
//         image_url: `/uploads/products/${f.filename}`,
//       }));
//       await ProductImage.bulkCreate(imageRecords, { transaction: t });
//     }

//     // 5️⃣ Parse variants
//     let variantsArray = [];
//     try {
//       variantsArray = typeof variants === "string" ? JSON.parse(variants) : variants;
//     } catch (err) {
//       console.error("Failed to parse variants:", err);
//       variantsArray = [];
//     }

//     if (Array.isArray(variantsArray) && variantsArray.length > 0) {
//       // 🔄 Update or insert multiple variants
//       for (let i = 0; i < variantsArray.length; i++) {
//         const { id: variantId, attributes, sku, ...variantInfo } = variantsArray[i];
//         let variant;

//         if (variantId) {
//           // 🔄 Update existing variant
//           variant = await ProductVariant.findOne({
//             where: { id: variantId, product_id: id },
//             transaction: t,
//           });

//           if (variant) {
//             await variant.update(
//               {
//                 ...variantInfo,
//                 sku: sku || variant.sku,
//                 price: normalizeNumber(variantInfo.price, variant.price),
//                 selling_price: normalizeNumber(variantInfo.selling_price, variant.selling_price),
//                 stock: normalizeNumber(variantInfo.stock, variant.stock),
//                 shipping_cost: normalizeNumber(variantInfo.shipping_cost, variant.shipping_cost),
//               },
//               { transaction: t }
//             );

//             // 🔄 Update attributes
//             if (attributes && attributes.length > 0) {
//               await ProductVariantAttributeValue.destroy({
//                 where: { variant_id: variant.id },
//                 transaction: t,
//               });

//               const pvavRecords = attributes.map(attr => ({
//                 product_id: id,
//                 variant_id: variant.id,
//                 attribute_id: attr.attribute_id,
//                 attribute_value_id: attr.attribute_value_id,
//               }));
//               await ProductVariantAttributeValue.bulkCreate(pvavRecords, { transaction: t });
//             }
//           }
//         } else {
//           // ➕ Create new variant
//           const newSku =
//             sku ||
//             `SKU-${id}-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

//           variant = await ProductVariant.create(
//             {
//               ...variantInfo,
//               product_id: id,
//               sku: newSku,
//               price: normalizeNumber(variantInfo.price, 0.0),
//               selling_price: normalizeNumber(variantInfo.selling_price, 0.0),
//               stock: normalizeNumber(variantInfo.stock, 0),
//               shipping_cost: normalizeNumber(variantInfo.shipping_cost, 0.0),
//             },
//             { transaction: t }
//           );

//           // ➕ Add attributes
//           if (attributes && attributes.length > 0) {
//             const pvavRecords = attributes.map(attr => ({
//               product_id: id,
//               variant_id: variant.id,
//               attribute_id: attr.attribute_id,
//               attribute_value_id: attr.attribute_value_id,
//             }));
//             await ProductVariantAttributeValue.bulkCreate(pvavRecords, { transaction: t });
//           }
//         }

//         // 🔄 Add new variant-level images
//         const variantFiles = (req.files || []).filter(f => f.fieldname === `variant_${i}_image`);
//         if (variantFiles.length > 0) {
//           const variantImageRecords = variantFiles.map(f => ({
//             product_id: id,
//             variant_id: variant.id,
//             image_url: `/uploads/products/${f.filename}`,
//           }));
//           await ProductImage.bulkCreate(variantImageRecords, { transaction: t });
//         }
//       }
//     } else {
//       // 📌 Simple product case (update its first variant directly)
//       const firstVariant = await ProductVariant.findOne({
//         where: { product_id: id },
//         order: [["id", "ASC"]],
//         transaction: t,
//       });

//       if (firstVariant) {
//         await firstVariant.update(
//           {
//             price: normalizeNumber(price, firstVariant.price),
//             selling_price: normalizeNumber(selling_price, firstVariant.selling_price),
//             stock: normalizeNumber(stock, firstVariant.stock),
//             shipping_cost: normalizeNumber(shipping_cost, firstVariant.shipping_cost),
//           },
//           { transaction: t }
//         );
//       }
//     }

//     // ✅ Commit after all success
//     await t.commit();

//     // 6️⃣ Fetch updated product with relations
//     const updatedProduct = await Product.findOne({
//       where: { id },
//       include: [
//         { model: ProductImage, as: "images" },
//         {
//           model: ProductVariant,
//           as: "variants",
//           include: [
//             {
//               model: ProductVariantAttributeValue,
//               as: "attributes",
//               include: [
//                 { model: Attribute, as: "attribute", attributes: ["id", "name", "input_type"] },
//                 { model: AttributeValue, as: "attribute_value", attributes: ["id", "value"] },
//               ],
//             },
//             { model: ProductImage, as: "variant_images" },
//           ],
//         },
//       ],
//     });

//     return apiResponse.successResponseWithData(
//       res,
//       "Product updated successfully",
//       updatedProduct
//     );
//   } catch (err) {
//     if (!t.finished) {
//       await t.rollback();
//     }
//     console.error("Update product error:", err);
//     return apiResponse.ErrorResponse(res, err.message);
//   }
// };

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

    // 4️⃣ Add new product-level images
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
          images: variantImages,
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
          console.log("add new");
          console.log(attributes);
          if (attributes && attributes.length > 0) {
            const pvavRecords = attributes.map((attr) => ({
              product_id: id,
              variant_id: variant.id,
              attribute_id: attr.attribute_id || attr.attribute?.id,
              attribute_value_id: attr.attribute_value_id,
            }));
            console.log(pvavRecords);
            await ProductVariantAttributeValue.bulkCreate(pvavRecords, {
              transaction: t,
            });
          }
        }

        // 🔄 Handle variant images (file uploads)
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

        // 🔄 Handle variant images (URLs from body)
        if (Array.isArray(variantImages) && variantImages.length > 0) {
          const urlImages = variantImages
            .filter((img) => typeof img === "string" && img.trim() !== "")
            .map((url) => ({
              product_id: id,
              variant_id: variant.id,
              image_url: url,
            }));
          if (urlImages.length > 0) {
            await ProductImage.bulkCreate(urlImages, { transaction: t });
          }
        }
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
    // ✅ Logged-in user ID (from auth middleware or query param)
    const userId = req.user?.id || null;
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
      attributes: ["id", "name", "description"],
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
      description: p.description,
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
