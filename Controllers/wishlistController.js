import Wishlist from "../Schema/wishlist.js";
import Product from "../Schema/product.js";
import ProductImage from "../Schema/productImage.js";
import ProductVariant from "../Schema/productVariant.js";
import ProductVariantAttributeValue from "../Schema/productVariantAttributeValue.js";
import Attribute from "../Schema/attribute.js";
import AttributeValue from "../Schema/attributeValue.js";

import appapiResponse from "../Helper/appapiResponse.js";
import apiResponse from "../Helper/apiResponse.js";



// Add to wishlist
export const addToWishlist = async (req, res) => {
  try {
    const { product_id } = req.body;
    const userId = req.user.id; // ✅ from auth middleware

    // prevent duplicates
    const existing = await Wishlist.findOne({
      where: { user_id: userId, product_id },
    });
    if (existing) {
      return appapiResponse.ErrorResponse(res, "Already in wishlist");
    }

    const wishlist = await Wishlist.create({
      user_id: userId,
      product_id
    });

    return appapiResponse.successResponseWithData(
      res,
      "Added to wishlist",
      wishlist
    );
  } catch (error) {
    return appapiResponse.ErrorResponse(res, error.message);
  }
};

// Get wishlist
export const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    // ✅ Fetch wishlist items with product and related data
    const items = await Wishlist.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Product,
          as: "product",
          where: { is_deleted: false },
          attributes: ["id", "name", "description", "product_type"],
          include: [
            {
              model: ProductImage,
              as: "images",
              where: { is_deleted: false },
              required: false,
              attributes: ["id", "image_url", "is_primary"],
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
                "selling_price",
                "shipping_cost",
                "stock",
                "is_default",
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
        },
      ],
    });

    // ✅ Transform response like getAppProductList
    const formatted = items.map((i) => {
      const p = i.product;

      const gallery = p.images.map((img) => img.image_url);
      const thumbnail =
        p.images.find((img) => img.is_primary)?.image_url ||
        p.images[0]?.image_url ||
        null;

      const variants = p.variants.map((v) => ({
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
      }));

      return {
        id: p.id,
        name: p.name,
        description: p.description,
        product_type: p.product_type,
        is_wishlist: true,
        thumbnail,
        gallery,
        variants,
      };
    });

    return appapiResponse.successResponseWithData(
      res,
      "Wishlist fetched successfully",
      formatted
    );
  } catch (error) {
    console.error("Wishlist Error:", error);
    return appapiResponse.ErrorResponse(res, error.message);
  }
};


// Remove from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const deleted = await Wishlist.destroy({
      where: { product_id:id, user_id: userId },
    });

    if (!deleted) {
      return appapiResponse.ErrorResponse(res, "Item not found in wishlist");
    }

    return appapiResponse.successResponseWithData(res, "Removed from wishlist");
  } catch (error) {
    return appapiResponse.ErrorResponse(res, error.message);
  }
};

// Add to wishlist
export const addToWishlistweb = async (req, res) => {
  try {
    const { product_id } = req.body;
    const userId = req.user.id; // ✅ from auth middleware

    // prevent duplicates
    const existing = await Wishlist.findOne({
      where: { user_id: userId, product_id },
    });
    if (existing) {
      return apiResponse.ErrorResponse(res, "Already in wishlist");
    }

    const wishlist = await Wishlist.create({
      user_id: userId,
      product_id
    });

    return apiResponse.successResponseWithData(
      res,
      "Added to wishlist",
      wishlist
    );
  } catch (error) {
    return apiResponse.ErrorResponse(res, error.message);
  }
};

// Get wishlist
export const getWishlistweb = async (req, res) => {
  try {
    const userId = req.user.id;

    const items = await Wishlist.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Product,
          as: "product",
          where: { is_deleted: false },
          attributes: ["id", "name", "short_description", "description", "createdAt","product_type"],
          include: [
            {
              model: ProductImage,
              as: "images",
              where: { is_deleted: false },
              required: false,
              attributes: ["id", "image_url", "is_primary"],
            },
            {
              model: ProductVariant,
              as: "variants",
              where: { is_deleted: false },
              required: false,
              attributes: ["id", "sku", "price", "selling_price", "stock"],
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
        },
      ],
    });

    const formatted = items.map((i) => {
      const product = i.product;

      // Base product image (fallback)
      const baseImage =
        product.images?.find((img) => img.is_primary)?.image_url ||
        product.images?.[0]?.image_url ||
        null;

      // Map all variants
      const variants = (product.variants || []).map((variant) => {
        // Variant attributes
        const attributes =
          variant.attributes?.map((attr) => ({
            attribute_id: attr.attribute?.id,
            attribute_name: attr.attribute?.name,
            value_id: attr.attribute_value?.id,
            value: attr.attribute_value?.value,
          })) || [];

        // Variant image (primary or fallback)
        const variantImage =
          variant.variant_images?.find((img) => img.is_primary)?.image_url ||
          variant.variant_images?.[0]?.image_url ||
          baseImage;

        const price = parseFloat(variant.price || 0);
        const sellingPrice = parseFloat(variant.selling_price || 0);

        const discount =
          price > 0 && sellingPrice > 0 && price > sellingPrice
            ? Math.round(((price - sellingPrice) / price) * 100)
            : 0;

        return {
          id: variant.id,
          sku: variant.sku,
          price: price.toFixed(2),
          sellingPrice: sellingPrice.toFixed(2),
          discount,
          stock: variant.stock || 0,
          image: variantImage,
          attributes,
        };
      });

      // If no variants, create one default based on product
      if (!variants.length) {
        variants.push({
          id: null,
          sku: null,
          price: "0.00",
          sellingPrice: "0.00",
          discount: 0,
          stock: 0,
          image: baseImage,
          attributes: [],
        });
      }

      // Use first variant for top-level price & discount
      const firstVariant = variants[0];
      const price = firstVariant.price;
      const sellingPrice = firstVariant.sellingPrice;
      const discount = firstVariant.discount;

      return {
        id: product.id,
        product_type:product.product_type,
        name: product.name,
        description: product.short_description || product.description || "",
        price,
        sellingPrice,
        discount,
        image: firstVariant.image,
        category: product.category || null,
        rating: product.rating || 0,
        stockStatus: product.stockStatus || "in",
        onSale: product.onSale || false,
        addedDate: product.createdAt,
        variants, // <-- include all variant details
      };
    });

    return apiResponse.successResponseWithData(
      res,
      "Wishlist fetched successfully",
      formatted
    );
  } catch (error) {
    console.error("❌ Wishlist Fetch Error:", error);
    return apiResponse.ErrorResponse(res, error.message);
  }
};

// Remove from wishlist
export const removeFromWishlistweb = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const deleted = await Wishlist.destroy({
      where: { product_id:id, user_id: userId },
    });

    if (!deleted) {
      return apiResponse.ErrorResponse(res, "Item not found in wishlist");
    }

    return apiResponse.successResponseWithData(res, "Removed from wishlist");
  } catch (error) {
    return apiResponse.ErrorResponse(res, error.message);
  }
};
