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
      razorpay_payment_id = null,
    } = req.body;

    // ✅ Validate required fields
    if (!product_id) return apiResponse.ErrorResponse(res, "Product ID is required");
    if (!address_id) return apiResponse.ErrorResponse(res, "Address ID is required");
    if (!payment_id) return apiResponse.ErrorResponse(res, "Payment type is required");

    // ✅ Fetch product with shop_id (seller reference)
    const product = await Product.findByPk(product_id, {
      attributes: ["id", "title", "price", "shop_id"],
    });

    if (!product) return apiResponse.ErrorResponse(res, "Product not found");

    // ✅ Determine variant and price
    let selectedVariant = null;
    let sellingPrice = 0;

    if (variant_id) {
      selectedVariant = await ProductVariant.findOne({
        where: { id: variant_id, product_id },
      });

      if (!selectedVariant) {
        return apiResponse.ErrorResponse(res, "Invalid variant selected");
      }

      sellingPrice = selectedVariant.selling_price;
    } else {
      // No variant selected → use first variant or base product price
      selectedVariant = await ProductVariant.findOne({
        where: { product_id },
        order: [["id", "ASC"]],
      });

      sellingPrice = selectedVariant
        ? selectedVariant.selling_price
        : product.price;
    }

    // ✅ Calculate total amount
    const totalAmount = sellingPrice * quantity;

    // ✅ Create order (include seller_id from product.shop_id)
    const order = await Order.create({
      user_id: userId,
      seller_id: product.shop_id, // 👈 added seller reference
      address_id,
      payment_id,
      total_amount: totalAmount,
      razorpay_payment_id: razorpay_payment_id,
      status: "pending",
      is_buy_now: true,
    });

    // ✅ Create order item
    await OrderItem.create({
      order_id: order.id,
      product_id,
      variant_id: variant_id || (selectedVariant ? selectedVariant.id : null),
      quantity,
      price: sellingPrice,
    });

    // ✅ Return success response
    return apiResponse.successResponseWithData(
      res,
      "Buy now order placed successfully",
      {
        order,
        item: {
          product_id,
          variant_id,
          quantity,
          price: sellingPrice,
        },
      }
    );
  } catch (error) {
    console.error("Error in buyNowAddToCart:", error);
    return apiResponse.ErrorResponse(res, error.message);
  }
};

// export const buyNowAddToCart = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const {
//       product_id,
//       variant_id = null,
//       quantity = 1,
//       address_id,
//       payment_id,
//       razorpay_payment_id = null,
//     } = req.body;

//     if (!product_id) return apiResponse.ErrorResponse(res, "Product ID is required");
//     if (!address_id) return apiResponse.ErrorResponse(res, "Address ID is required");
//     if (!payment_id) return apiResponse.ErrorResponse(res, "Payment type is required");

//     // ✅ Fetch product with shop_id (seller reference)
//     const product = await Product.findByPk(product_id, {
//       attributes: ["id", "title", "price", "shop_id", "name", "short_description"],
//       include: [
//         {
//           model: ProductImage,
//           as: "images",
//           where: { is_deleted: false },
//           required: false,
//           attributes: ["id", "image_url", "is_primary"],
//         },
//       ],
//     });

//     if (!product) return apiResponse.ErrorResponse(res, "Product not found");

//     // ✅ Determine variant and price
//     let selectedVariant = null;
//     let sellingPrice = 0;

//     if (variant_id) {
//       selectedVariant = await ProductVariant.findOne({
//         where: { id: variant_id, product_id },
//       });

//       if (!selectedVariant)
//         return apiResponse.ErrorResponse(res, "Invalid variant selected");

//       sellingPrice = parseFloat(selectedVariant.selling_price);
//     } else {
//       selectedVariant = await ProductVariant.findOne({
//         where: { product_id },
//         order: [["id", "ASC"]],
//       });

//       sellingPrice = selectedVariant
//         ? parseFloat(selectedVariant.selling_price)
//         : parseFloat(product.price);
//     }

//     // ✅ Calculate totals
//     const subtotal = sellingPrice * quantity;
//     const tax = parseFloat((subtotal * 0.1).toFixed(2)); // 10% tax
//     const shipping = 0;
//     const totalAmount = parseFloat((subtotal + tax + shipping).toFixed(2));

//     // ✅ Get address and payment method
//     const address = await userAddress.findOne({
//       where: { id: address_id, user_id: userId },
//     });
//     if (!address) return apiResponse.ErrorResponse(res, "Address not found");

//     const paymentMethod = await PaymentMethod.findOne({
//       where: { id: payment_id },
//     });
//     if (!paymentMethod)
//       return apiResponse.ErrorResponse(res, "Payment method not found");

//     // ✅ Create order
//     const order = await Order.create({
//       user_id: userId,
//       seller_id: product.shop_id,
//       address_id,
//       payment_id,
//       total_amount: totalAmount,
//       subtotal,
//       tax,
//       shipping,
//       razorpay_payment_id,
//       status: "pending",
//       is_buy_now: true,
//     });

//     // ✅ Create order item
//     await OrderItem.create({
//       order_id: order.id,
//       product_id,
//       variant_id: variant_id || (selectedVariant ? selectedVariant.id : null),
//       quantity,
//       price: sellingPrice,
//     });

//     // 📅 Estimated delivery
//     const estimatedDelivery = new Date();
//     estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);
//     const formattedDelivery = estimatedDelivery.toISOString().split("T")[0];

//     // 🖼 Image
//     const image =
//       product.images?.find((img) => img.is_primary)?.image_url ||
//       product.images?.[0]?.image_url ||
//       null;

//     // ✅ Construct response same as placeOrder
//     const responseData = {
//       address,
//       paymentMethod,
//       subtotal,
//       tax,
//       shipping,
//       totalAmount,
//       orders: [
//         {
//           orderId: `ORD${order.id}`,
//           sellerId: product.shop_id,
//           subtotal,
//           tax,
//           shipping,
//           totalAmount,
//           estimatedDelivery: formattedDelivery,
//           items: [
//             {
//               id: product.id,
//               name: product.name,
//               image,
//               quantity,
//               sellingPrice: sellingPrice.toFixed(2),
//             },
//           ],
//         },
//       ],
//     };

//     return apiResponse.successResponseWithData(
//       res,
//       "Buy now order placed successfully",
//       responseData
//     );
//   } catch (error) {
//     console.error("Error in buyNowAddToCart:", error);
//     return apiResponse.ErrorResponse(res, error.message);
//   }
// };


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


