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
import apiResponse from "../Helper/apiResponse.js";

// ✅ Add Product
// export const addProduct = async (req, res) => {
//   try {
//     const record = await createProduct(req.body);
//     return apiResponse.successResponseWithData(res, "Product created", record);
//   } catch (err) {
//     return apiResponse.ErrorResponse(res, err.message);
//   }
// };

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

    // ✅ 2. Save images if provided

    if (req.files && req.files.length > 0) {
  const imageRecords = req.files.map(file => ({
    product_id: product.id,
    image_url: `/uploads/products/${file.filename}`, // store path in DB
  }));
  await ProductImage.bulkCreate(imageRecords, { transaction: t });
}

    // ✅ 3. If variants exist → loop & insert
    let variantsArray = [];
    try {
  variantsArray = typeof variants === "string" ? JSON.parse(variants) : variants;
} catch (err) {
  console.error("Failed to parse variants:", err);
  variantsArray = [];
}

    if (variantsArray && Array.isArray(variantsArray) && variantsArray.length > 0) {

      for (const variantData of variantsArray) {
        const { attributes, ...variantInfo } = variantData;

        // Unique SKU per variant
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
      }
    } else {
      // ✅ Simple variant
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
      "Product (with or without variants) created",
      product
    );
  } catch (err) {
    await t.rollback();
    console.log(err);
    return apiResponse.ErrorResponse(res, err.message);
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
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
      "Fetched products with variants & attributes successfully",
      products
    );
  } catch (err) {
    console.error("Error in getAllProductsAPI:", err);

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
