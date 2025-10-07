import {Cart} from "../Models/cartModel.js";
import {Product} from "../Models/productModel.js";
import {ProductImage} from "../Models/productImageModel.js";
import {ProductVariant} from "../Models/productVariantModel.js";

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

    const formatted = items.map((i) => {
      // ✅ Use product variant or fallback to first
      const variant = i.variant || i.product.variants?.[0] || null;
      const images = variant ? variant.variant_images : i.product.images;

      const price = parseFloat(variant?.selling_price || 0);
      const originalPrice = parseFloat(variant?.price || price);
      const discount =
        originalPrice > 0
          ? Math.round(((originalPrice - price) / originalPrice) * 100)
          : 0;

      return {
        id: i.id,
        name: i.product.name,
        description: i.product.short_description || "",
        price: price.toFixed(2),
        originalPrice: originalPrice.toFixed(2),
        sellingPrice: price.toFixed(2),
        discount: discount,
        image:
          images.find((img) => img.is_primary)?.image_url ||
          images[0]?.image_url ||
          null,
        category: i.product.category_id || null,
        rating: 0,
        stockStatus: (variant?.stock || 0) > 0 ? "in" : "out",
        onSale: discount > 0,
        quantity: i.quantity, // ✅ Added quantity from Cart table
      };
    });

    return apiResponse.successResponseWithData(
      res,
      "Cart fetched successfully",
      formatted
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

    const formatted = items.map((i) => {
      // ✅ Use product variant or fallback to first
      const variant = i.variant || i.product.variants?.[0] || null;
      const images = variant ? variant.variant_images : i.product.images;

      const price = parseFloat(variant?.selling_price || 0);
      const originalPrice = parseFloat(variant?.price || price);
      const discount =
        originalPrice > 0
          ? Math.round(((originalPrice - price) / originalPrice) * 100)
          : 0;

      return {
        id: i.id,
        name: i.product.name,
        description: i.product.short_description || "",
        price: price.toFixed(2),
        originalPrice: originalPrice.toFixed(2),
        sellingPrice: price.toFixed(2),
        discount: discount,
        image:
          images.find((img) => img.is_primary)?.image_url ||
          images[0]?.image_url ||
          null,
        category: i.product.category_id || null,
        rating: 0,
        stockStatus: (variant?.stock || 0) > 0 ? "in" : "out",
        onSale: discount > 0,
        quantity: i.quantity, // ✅ Added quantity from Cart table
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
