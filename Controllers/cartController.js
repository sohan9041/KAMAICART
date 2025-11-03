import {Cart} from "../Models/cartModel.js";
import {Product} from "../Models/productModel.js";
import {ProductImage} from "../Models/productImageModel.js";
import {ProductVariant} from "../Models/productVariantModel.js";
import { ProductVariantAttributeValue } from "../Models/ProductVariantAttributeValueModel.js";
import { Attribute } from "../Models/attributeModel.js";
import { AttributeValue } from "../Models/attributeValueModel.js";

import apiResponse from "../Helper/apiResponse.js";
import appapiResponse from "../Helper/appapiResponse.js";
import Order from "../Schema/order.js";
import OrderItem from "../Schema/orderItem.js";
import { PromoCode } from "../Models/promoCode.js";
import { SortOption } from "../Models/sortOption.js";
import { userAddress } from "../Models/userAddressModel.js";
import PaymentMethod from "../Schema/paymentMethod.js";


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
            {
              model: ProductVariant,
              as: "variants", // ✅ Add all product variants
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
      // ✅ If no variant is selected, use first variant from product
      const hasVariant = !!i.variant_id;
      const variant =
        i.variant ||
        (i.product.variants && i.product.variants.length > 0
          ? i.product.variants[0]
          : null);

      // ✅ Select correct images
      const images = variant?.variant_images?.length
        ? variant.variant_images
        : i.product.images || [];

      // ✅ Compute prices
      const price = parseFloat(variant?.selling_price ?? variant?.price ?? 0);
      const originalPrice = parseFloat(variant?.price ?? variant?.selling_price ?? 0);
      const discount =
        originalPrice > 0
          ? Math.round(((originalPrice - price) / originalPrice) * 100)
          : 0;

      // ✅ Build variant details
      const variantDetails = variant
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
        price: parseFloat(originalPrice.toFixed(2)),
        selling_price: parseFloat(price.toFixed(2)),
        discount,
        image:
          images.find((img) => img.is_primary)?.image_url ||
          images[0]?.image_url ||
          null,
        category: i.product.category_id || null,
        rating: 0,
        stockStatus: (variant?.stock || 0) > 0 ? "in" : "out",
        onSale: discount > 0,
        quantity: i.quantity,
        ...(variant && { variant: variantDetails }), // ✅ Include only if available
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

export const buyNowAddToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      product_id,
      variant_id = null,
      quantity = 1,
      address_id,
      payment_id,
      promo_code_id = null,
      razorpay_payment_id = null,
    } = req.body;

    if (!product_id) return apiResponse.ErrorResponse(res, "Product ID is required");
    if (!address_id) return apiResponse.ErrorResponse(res, "Address ID is required");
    if (!payment_id) return apiResponse.ErrorResponse(res, "Payment type is required");

    // ✅ Fetch product with images + variants
    const product = await Product.findByPk(product_id, {
      attributes: ["id", "name", "shop_id"],
      include: [
        {
          model: ProductImage,
          as: "images",
          where: { is_deleted: false },
          required: false,
          attributes: ["image_url", "is_primary"],
        },
        {
          model: ProductVariant,
          as: "variants",
          where: { is_deleted: false },
          required: false,
          attributes: ["id", "selling_price"],
          include: [
            {
              model: ProductImage,
              as: "variant_images",
              where: { is_deleted: false },
              required: false,
              attributes: ["image_url", "is_primary"],
            }
          ]
        }
      ]
    });

    if (!product) return apiResponse.ErrorResponse(res, "Product not found");

    // ✅ Variant selection logic
    let selectedVariant = variant_id
      ? product.variants?.find(v => v.id == variant_id)
      : (product.variants?.[0] || null);

    if (variant_id && !selectedVariant)
      return apiResponse.ErrorResponse(res, "Invalid variant selected");

    const sellingPrice = selectedVariant ? selectedVariant.selling_price : 1;

    let subtotal = sellingPrice * quantity;
    let tax = subtotal * 0.10;
    let shipping = 0;
    let totalBeforeDiscount = subtotal + tax + shipping;

    // ✅ Apply Promo Code logic (same as checkout)
    let discountAmount = 0;
    let appliedPromo = null;

    if (promo_code_id) {
      const promo = await PromoCode.findOne({
        where: { id: promo_code_id, is_active: true, is_deleted: false }
      });

      if (!promo)
        return apiResponse.ErrorResponse(res, "Invalid or inactive promo code");

      const now = new Date();
      if (promo.valid_from && now < promo.valid_from)
        return apiResponse.ErrorResponse(res, "Promo code not yet active");
      if (promo.valid_to && now > promo.valid_to)
        return apiResponse.ErrorResponse(res, "Promo code expired");
      if (promo.usage_limit > 0 && promo.used_count >= promo.usage_limit)
        return apiResponse.ErrorResponse(res, "Promo usage limit reached");
      if (promo.min_order_value && totalBeforeDiscount < promo.min_order_value)
        return apiResponse.ErrorResponse(
          res, `Minimum order value should be ₹${promo.min_order_value}`
        );

      if (promo.discount_type === "fixed") {
        discountAmount = promo.discount_value;
      } else if (promo.discount_type === "percent") {
        discountAmount = (promo.discount_value / 100) * totalBeforeDiscount;
        if (promo.max_discount && discountAmount > promo.max_discount)
          discountAmount = promo.max_discount;
      }

      if (discountAmount > totalBeforeDiscount) discountAmount = totalBeforeDiscount;
      appliedPromo = promo;
    }

    const finalAmount = totalBeforeDiscount - discountAmount;

    // ✅ Get product/variant image
    let imageUrl = null;

    if (selectedVariant?.variant_images?.length) {
      imageUrl =
        selectedVariant.variant_images.find(img => img.is_primary)?.image_url ||
        selectedVariant.variant_images[0].image_url;
    } else if (product.images?.length) {
      imageUrl =
        product.images.find(img => img.is_primary)?.image_url ||
        product.images[0].image_url;
    }

    // ✅ Create Order
    const order = await Order.create({
      user_id: userId,
      seller_id: product.shop_id,
      address_id,
      payment_id,
      total_amount: finalAmount,
      promo_code_id: appliedPromo ? appliedPromo.id : null, // ✅ store promo id
      razorpay_payment_id,
      status: "pending",
      is_buy_now: true,
    });

    // ✅ Order Item
    await OrderItem.create({
      order_id: order.id,
      product_id,
      variant_id: selectedVariant ? selectedVariant.id : null,
      quantity,
      price: sellingPrice,
    });

    // ✅ Fetch Address & Payment Method
    const address = await userAddress.findByPk(address_id);
    const paymentMethod = await PaymentMethod.findByPk(payment_id);

    // ✅ Final Response
    const responseData = {
      address,
      paymentMethod,
      subtotal,
      tax,
      shipping,
      discountAmount,
      totalBeforeDiscount,
      totalAmount: finalAmount,
      promo_code: appliedPromo ? appliedPromo.code : null,
      orders: [
        {
          orderId: `ORD${order.id}`,
          sellerId: product.shop_id.toString(),
          subtotal,
          tax,
          shipping,
          discountAmount,
          totalAmount: finalAmount,
          estimatedDelivery: new Date(Date.now() + 7 * 86400000)
            .toISOString().split("T")[0],
          items: [
            {
              id: product.id,
              name: product.name,
              image: imageUrl,
              quantity,
              sellingPrice
            }
          ]
        }
      ]
    };

    return apiResponse.successResponseWithData(res, "Order placed successfully", responseData);

  } catch (error) {
    console.error("Error in buyNowAddToCart:", error);
    return apiResponse.ErrorResponse(res, error.message);
  }
};


export const appbuyNowAddToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      product_id,
      variant_id = null,
      quantity = 1,
      address_id,
      payment_id,
      razorpay_payment_id = null,
    } = req.body;

    // ✅ Validate required fields
    if (!product_id)
      return appapiResponse.ErrorResponse(res, "Product ID is required");
    if (!address_id)
      return appapiResponse.ErrorResponse(res, "Address ID is required");
    if (!payment_id)
      return appapiResponse.ErrorResponse(res, "Payment type is required");

    // ✅ Fetch product to get seller/shop info
    const product = await Product.findByPk(product_id, {
      attributes: ["id", "shop_id", "name"],
    });

    if (!product)
      return appapiResponse.ErrorResponse(res, "Product not found");

    // ✅ Determine which variant to use
    let selectedVariant;

    if (variant_id) {
      // Variant explicitly chosen by user
      selectedVariant = await ProductVariant.findOne({
        where: { id: variant_id, product_id, is_deleted: false },
        attributes: ["id", "selling_price", "shipping_cost", "price"],
      });

      if (!selectedVariant)
        return appapiResponse.ErrorResponse(res, "Invalid variant selected");
    } else {
      // No variant selected → pick the default or first variant
      selectedVariant = await ProductVariant.findOne({
        where: { product_id },
        attributes: ["id", "selling_price", "shipping_cost", "price"],
      });

      if (!selectedVariant)
        return appapiResponse.ErrorResponse(res, "No variants found for this product");
    }

    // ✅ Calculate total price
    const sellingPrice = parseFloat(selectedVariant.selling_price || 0);
    const shippingCost = parseFloat(selectedVariant.shipping_cost || 0);
    const totalAmount = (sellingPrice * quantity) + shippingCost;

    // ✅ Create order with seller_id from product.shop_id
    const order = await Order.create({
      user_id: userId,
      seller_id: product.shop_id,
      address_id,
      payment_id,
      total_amount: totalAmount,
      razorpay_payment_id,
      status: "pending",
      is_buy_now: true,
    });

    // ✅ Create order item
    await OrderItem.create({
      order_id: order.id,
      product_id,
      variant_id: selectedVariant.id,
      quantity,
      price: sellingPrice,
      shipping_cost: shippingCost,
    });

    // ✅ Return success response
    return appapiResponse.successResponseWithData(
      res,
      "Buy now order placed successfully",
      {
        order,
        item: {
          product_id,
          variant_id: selectedVariant.id,
          quantity,
          selling_price: sellingPrice,
          shipping_cost: shippingCost,
          total: totalAmount,
        },
      }
    );
  } catch (error) {
    console.error("Error in appbuyNowAddToCart:", error);
    return appapiResponse.ErrorResponse(res, error.message);
  }
};

export const checkout = async (req, res) => {
  try {
    const userId = req.user.id;
    const { promo_code_id = null } = req.body;

    // ✅ Step 1: Fetch user's cart
    const cartItems = await Cart.findAll({
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
              ],
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

    if (!cartItems.length)
      return apiResponse.ErrorResponse(res, "Your cart is empty");

    // ✅ Step 2: Format cart items (same structure as appgetCart)
    const cartDetails = cartItems.map((i) => {
      const hasVariant = !!i.variant_id;
      const variant =
        i.variant ||
        (i.product.variants && i.product.variants.length > 0
          ? i.product.variants[0]
          : null);

      const images = variant?.variant_images?.length
        ? variant.variant_images
        : i.product.images || [];

      const price = parseFloat(variant?.selling_price ?? variant?.price ?? 0);
      const originalPrice = parseFloat(variant?.price ?? variant?.selling_price ?? 0);
      const discount =
        originalPrice > 0
          ? Math.round(((originalPrice - price) / originalPrice) * 100)
          : 0;

      const variantDetails = variant
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
        id: i.product.id,
        name: i.product.name,
        description: i.product.short_description || "",
        price: parseFloat(originalPrice.toFixed(2)),
        selling_price: parseFloat(price.toFixed(2)),
        discount,
        image:
          images.find((img) => img.is_primary)?.image_url ||
          images[0]?.image_url ||
          null,
        category: i.product.category_id || null,
        rating: 0,
        stockStatus: (variant?.stock || 0) > 0 ? "in" : "out",
        onSale: discount > 0,
        quantity: i.quantity,
        ...(variant && { variant: variantDetails }),
      };
    });

    // ✅ Step 3: Calculate totals
    let totalAmount = 0;
    for (const item of cartDetails) {
      totalAmount += item.selling_price * item.quantity;
    }

    // ✅ Step 4: Apply promo code (optional)
    let discountAmount = 0;
    let appliedPromo = null;

    if (promo_code_id) {
      const promo = await PromoCode.findOne({
        where: { id: promo_code_id, is_active: true, is_deleted: false },
      });

      if (!promo)
        return appapiResponse.ErrorResponse(res, "Invalid or inactive promo code");

      const now = new Date();
      if (promo.valid_from && now < promo.valid_from)
        return appapiResponse.ErrorResponse(res, "Promo code not yet active");
      if (promo.valid_to && now > promo.valid_to)
        return appapiResponse.ErrorResponse(res, "Promo code has expired");
      if (promo.usage_limit > 0 && promo.used_count >= promo.usage_limit)
        return appapiResponse.ErrorResponse(res, "Promo code usage limit reached");
      if (promo.min_order_value && totalAmount < promo.min_order_value)
        return appapiResponse.ErrorResponse(
          res,
          `Minimum order value should be ₹${promo.min_order_value}`
        );

      if (promo.discount_type === "fixed") {
        discountAmount = promo.discount_value;
      } else if (promo.discount_type === "percent") {
        discountAmount = (promo.discount_value / 100) * totalAmount;
        if (promo.max_discount && discountAmount > promo.max_discount)
          discountAmount = promo.max_discount;
      }

      if (discountAmount > totalAmount) discountAmount = totalAmount;
      appliedPromo = promo;
    }

    const finalAmount = totalAmount - discountAmount;

    // ✅ Step 5: Final response
    return apiResponse.successResponseWithData(
      res,
      "Checkout calculation successful",
      {
        total_amount: totalAmount,
        discount_amount: discountAmount,
        final_amount: finalAmount,
        promo_code_id: appliedPromo ? appliedPromo.id : null,
        promo_code: appliedPromo ? appliedPromo.code : null,
        discount_type: appliedPromo ? appliedPromo.discount_type : null,
        discount_value: appliedPromo ? appliedPromo.discount_value : null,
        cart_items: cartDetails, // ✅ Same structure as appgetCart
      }
    );
  } catch (error) {
    console.error("Error in appCheckout:", error);
    return apiResponse.ErrorResponse(res, error.message);
  }
};

export const buyNowCheckout = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id, variant_id = null, promo_code_id = null } = req.body;

    if (!product_id)
      return apiResponse.ErrorResponse(res, "Product ID is required");

    // ✅ Step 1: Fetch product + variant details
    const product = await Product.findOne({
      where: { id: product_id, is_deleted: false },
      attributes: ["id", "name", "short_description", "category_id", "product_type"],
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
          attributes: ["id", "sku", "price", "selling_price", "shipping_cost", "stock"],
          include: [
            {
              model: ProductImage,
              as: "variant_images",
              where: { is_deleted: false },
              required: false,
              attributes: ["id", "image_url", "is_primary"],
            },
            {
              model: ProductVariantAttributeValue,
              as: "attributes",
              include: [
                { model: Attribute, as: "attribute", attributes: ["id", "name"] },
                { model: AttributeValue, as: "attribute_value", attributes: ["id", "value"] },
              ],
            },
          ],
        },
      ],
    });

    if (!product)
      return appapiResponse.ErrorResponse(res, "Product not found");

    // ✅ Step 2: Choose variant (if applicable)
    let variant = null;
    if (variant_id) {
      variant = product.variants.find(v => v.id === variant_id);
      if (!variant)
        return appapiResponse.ErrorResponse(res, "Invalid product variant");
    } else if (product.variants.length > 0) {
      variant = product.variants[0]; // default variant
    }

    const images = variant?.variant_images?.length
      ? variant.variant_images
      : product.images || [];

    const price = parseFloat(variant?.selling_price ?? variant?.price ?? 0);
    const originalPrice = parseFloat(variant?.price ?? variant?.selling_price ?? 0);
    const discount =
      originalPrice > 0
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : 0;

    // ✅ Step 3: Calculate totals (quantity fixed to 1 for Buy Now)
    const quantity = 1;
    let totalAmount = price * quantity;

    // ✅ Step 4: Apply promo code (optional)
    let discountAmount = 0;
    let appliedPromo = null;

    if (promo_code_id) {
      const promo = await PromoCode.findOne({
        where: { id: promo_code_id, is_active: true, is_deleted: false },
      });

      if (!promo)
        return appapiResponse.ErrorResponse(res, "Invalid or inactive promo code");

      const now = new Date();
      if (promo.valid_from && now < promo.valid_from)
        return appapiResponse.ErrorResponse(res, "Promo code not yet active");
      if (promo.valid_to && now > promo.valid_to)
        return appapiResponse.ErrorResponse(res, "Promo code has expired");
      if (promo.usage_limit > 0 && promo.used_count >= promo.usage_limit)
        return appapiResponse.ErrorResponse(res, "Promo code usage limit reached");
      if (promo.min_order_value && totalAmount < promo.min_order_value)
        return appapiResponse.ErrorResponse(
          res,
          `Minimum order value should be ₹${promo.min_order_value}`
        );

      if (promo.discount_type === "fixed") {
        discountAmount = promo.discount_value;
      } else if (promo.discount_type === "percent") {
        discountAmount = (promo.discount_value / 100) * totalAmount;
        if (promo.max_discount && discountAmount > promo.max_discount)
          discountAmount = promo.max_discount;
      }

      if (discountAmount > totalAmount) discountAmount = totalAmount;
      appliedPromo = promo;
    }

    const finalAmount = totalAmount - discountAmount;

    // ✅ Step 5: Prepare response data
    const responseData = {
      total_amount: totalAmount,
      discount_amount: discountAmount,
      final_amount: finalAmount,
      promo_code_id: appliedPromo ? appliedPromo.id : null,
      promo_code: appliedPromo ? appliedPromo.code : null,
      discount_type: appliedPromo ? appliedPromo.discount_type : null,
      discount_value: appliedPromo ? appliedPromo.discount_value : null,
    };

    return apiResponse.successResponseWithData(
      res,
      "Buy Now checkout calculation successful",
      responseData
    );
  } catch (error) {
    console.error("Error in appBuyNowCheckout:", error);
    return apiResponse.ErrorResponse(res, error.message);
  }
};

export const getSortOptions = async (req, res) => {
  try {
    const sortOptions = await SortOption.findAll({
      where: { status: 1 },
      order: [["sort_order", "ASC"]],
      attributes: ["id", "code", "name"], // ✅ only required fields
      raw: true
    });

    return appapiResponse.successResponseWithData(
      res,
      "Sort filters loaded successfully",
      sortOptions
    );

  } catch (err) {
    console.error("Sort Filter Error:", err);
    return appapiResponse.ErrorResponse(res, err.message);
  }
};


