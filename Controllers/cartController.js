import {Cart} from "../Models/cartModel.js";
import {Product} from "../Models/productModel.js";
import {ProductImage} from "../Models/productImageModel.js";
import {ProductVariant} from "../Models/productVariantModel.js";
import { ProductVariantAttributeValue } from "../Models/ProductVariantAttributeValueModel.js";
import { Attribute } from "../Models/attributeModel.js";
import { AttributeValue } from "../Models/attributeValueModel.js";

import apiResponse from "../Helper/apiResponse.js";
import appapiResponse from "../Helper/appapiResponse.js";


// Add to cart
export const addToCart = async (req, res) => {
  try {
    const { product_id, variant_id = null, quantity = 1 } = req.body;
    const userId = req.user.id;

    // ✅ Check if same product (and variant if given) already exists
    const whereCondition = {
      user_id: userId,
      product_id,
    };
    if (variant_id) whereCondition.variant_id = variant_id;

    const existing = await Cart.findOne({ where: whereCondition });

    if (existing) {
      // ✅ Update existing quantity
      existing.quantity += quantity;
      await existing.save();

      return apiResponse.successResponseWithData(
        res,
        "Cart updated successfully",
        existing
      );
    }

    // ✅ Create new cart record
    const cart = await Cart.create({
      user_id: userId,
      product_id,
      variant_id, // optional field
      quantity,
    });

    return apiResponse.successResponseWithData(res, "Added to cart", cart);
  } catch (error) {
    console.error("Error in addToCart:", error);
    return apiResponse.ErrorResponse(res, error.message);
  }
};


// Get cart items
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const items = await Cart.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Product,
          as: "product",
          where: { is_deleted: false },
          attributes: ["id", "name", "short_description", "category_id"],
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
              attributes: ["id", "price", "selling_price", "stock"],
              include: [
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
        {
          model: ProductVariant,
          as: "variant",
          where: { is_deleted: false },
          required: false,
          attributes: ["id", "price", "selling_price", "stock"],
          include: [
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

    let totalSellingPrice = 0;

    const formatted = items.map((i) => {
      const variant = i.variant || i.product.variants?.[0] || null;

      // ✅ Try variant images first, then fallback to product images
      const variantImages = variant?.variant_images || [];
      const productImages = i.product.images || [];
      const images = variantImages.length > 0 ? variantImages : productImages;

      // ✅ Select primary image (variant or product)
      const primaryImage =
        images.find((img) => img.is_primary)?.image_url ||
        images[0]?.image_url ||
        null;

      const price = parseFloat(variant?.selling_price || 0);
      const originalPrice = parseFloat(variant?.price || price);
      const discount =
        originalPrice > 0
          ? Math.round(((originalPrice - price) / originalPrice) * 100)
          : 0;

      const quantity = i.quantity || 1;
      totalSellingPrice += price * quantity;

      return {
        id: i.id,
        name: i.product.name,
        description: i.product.short_description || "",
        price: price.toFixed(2),
        originalPrice: originalPrice.toFixed(2),
        sellingPrice: price.toFixed(2),
        discount,
        image: primaryImage,
        category: i.product.category_id || null,
        rating: 0,
        stockStatus: (variant?.stock || 0) > 0 ? "in" : "out",
        onSale: discount > 0,
        quantity,
      };
    });

    return apiResponse.successResponseWithData(
      res,
      "Cart fetched successfully",
      formatted,
      { total: totalSellingPrice.toFixed(2) }
    );
  } catch (error) {
    console.error("Error in getCart:", error);
    return apiResponse.ErrorResponse(res, error.message);
  }
};

// Remove from cart
export const removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const deleted = await Cart.destroy({
      where: { id, user_id: userId },
    });

    if (!deleted) {
      return apiResponse.ErrorResponse(res, "Item not found in cart");
    }

    return apiResponse.successResponseWithData(res, "Removed from cart");
  } catch (error) {
    return apiResponse.ErrorResponse(res, error.message);
  }
};

// Update quantity
export const updateCartQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    const cartItem = await Cart.findOne({ where: { id, user_id: userId } });
    if (!cartItem) {
      return apiResponse.ErrorResponse(res, "Cart item not found");
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    return apiResponse.successResponseWithData(
      res,
      "Quantity updated",
      cartItem
    );
  } catch (error) {
    return apiResponse.ErrorResponse(res, error.message);
  }
};


// Add to cart
export const appaddToCart = async (req, res) => {
  try {
    const { product_id, variant_id = null, quantity = 1 } = req.body;
    const userId = req.user.id;

    // ✅ Check if same product (and variant if given) already exists
    const whereCondition = {
      user_id: userId,
      product_id,
    };
    if (variant_id) whereCondition.variant_id = variant_id;

    const existing = await Cart.findOne({ where: whereCondition });

    if (existing) {
      // ✅ Update existing quantity
      existing.quantity += quantity;
      await existing.save();

      return appapiResponse.successResponseWithData(
        res,
        "Cart updated successfully",
        existing
      );
    }

    // ✅ Create new cart record
    const cart = await Cart.create({
      user_id: userId,
      product_id,
      variant_id, // optional field
      quantity,
    });

    return appapiResponse.successResponseWithData(res, "Added to cart", cart);
  } catch (error) {
    console.error("Error in addToCart:", error);
    return appapiResponse.ErrorResponse(res, error.message);
  }
};


// Get cart items
export const appgetCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const items = await Cart.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Product,
          as: "product",
          where: { is_deleted: false },
          attributes: [
            "id",
            "name",
            "short_description",
            "category_id",
            "product_type",
          ],
          include: [
            {
              model: ProductImage,
              as: "images",
              where: { is_deleted: false },
              required: false,
              attributes: ["id", "image_url", "is_primary"],
            },
          ],
        },
        {
          model: ProductVariant,
          as: "variant",
          where: { is_deleted: false },
          required: false,
          attributes: [
            "id",
            "sku",
            "price",
            "selling_price",
            "shipping_cost",
            "stock",
          ],
          include: [
            {
              model: ProductVariantAttributeValue,
              as: "attributes",
              include: [
                {
                  model: Attribute,
                  as: "attribute",
                  attributes: ["id", "name"],
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

    const formatted = items.map((i) => {
      const hasVariant = !!i.variant_id;
      const variant = i.variant || null;

      // ✅ Pick correct images
      const images = hasVariant
        ? variant?.variant_images || []
        : i.product.images || [];

      // ✅ Compute prices
      const price = parseFloat(
        hasVariant ? variant?.selling_price || 0 : 0
      );
      const originalPrice = parseFloat(
        hasVariant ? variant?.price || price : price
      );
      const discount =
        originalPrice > 0
          ? Math.round(((originalPrice - price) / originalPrice) * 100)
          : 0;

      // ✅ Build variant object (only if variant exists)
      const variantDetails = hasVariant
        ? {
            id: variant.id,
            sku: variant.sku,
            stock: variant.stock,
            attributes:
              variant.attributes?.map((attr) => ({
                attribute_id: attr.attribute?.id,
                attribute_name: attr.attribute?.name,
                value_id: attr.attribute_value?.id,
                value: attr.attribute_value?.value,
              })) || [],
            images:
              variant.variant_images?.map((img) => ({
                id: img.id,
                url: img.image_url,
                is_primary: img.is_primary,
              })) || [],
          }
        : null;

      return {
        id: i.id,
        name: i.product.name,
        description: i.product.short_description || "",
        price: originalPrice.toFixed(2),
       // originalPrice: originalPrice.toFixed(2),
        selling_price: price.toFixed(2),
        discount: discount,
        image:
          images.find((img) => img.is_primary)?.image_url ||
          images[0]?.image_url ||
          null,
        category: i.product.category_id || null,
        rating: 0,
        stockStatus: (variant?.stock || 0) > 0 ? "in" : "out",
        onSale: discount > 0,
        quantity: i.quantity,
        ...(hasVariant && { variant: variantDetails }), // ✅ Include only if variant_id exists
      };
    });

    return appapiResponse.successResponseWithData(
      res,
      "Cart fetched successfully",
      formatted
    );
  } catch (error) {
    console.error("Error in getCart:", error);
    return appapiResponse.ErrorResponse(res, error.message);
  }
};

// Remove from cart
export const appremoveFromCart = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const deleted = await Cart.destroy({
      where: { id, user_id: userId },
    });

    if (!deleted) {
      return appapiResponse.ErrorResponse(res, "Item not found in cart");
    }

    return appapiResponse.successResponseWithData(res, "Removed from cart");
  } catch (error) {
    return appapiResponse.ErrorResponse(res, error.message);
  }
};

// Update quantity
export const appupdateCartQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    const cartItem = await Cart.findOne({ where: { id, user_id: userId } });
    if (!cartItem) {
      return appapiResponse.ErrorResponse(res, "Cart item not found");
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    return appapiResponse.successResponseWithData(
      res,
      "Quantity updated",
      cartItem
    );
  } catch (error) {
    return appapiResponse.ErrorResponse(res, error.message);
  }
};
