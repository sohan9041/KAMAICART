import { Order } from "../Models/orderModel.js";
import { OrderItem } from "../Models/orderItemModel.js";
import { Cart } from "../Models/cartModel.js";
import { Product } from "../Models/productModel.js";
import { ProductVariant } from "../Models/productVariantModel.js";

import apiResponse from "../Helper/apiResponse.js";
import appapiResponse from "../Helper/appapiResponse.js";
import { userAddress } from "../Models/userAddressModel.js";
import { ProductVariantAttributeValue } from "../Models/ProductVariantAttributeValueModel.js";
import { Attribute } from "../Models/attributeModel.js";
import { AttributeValue } from "../Models/attributeValueModel.js";
import { ProductImage } from "../Models/productImageModel.js";
import { PaymentMethod } from "../Models/paymentMethodModel.js";

import { PromoCode } from "../Models/promoCode.js";

export const appCheckout = async (req, res) => {
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
      return appapiResponse.ErrorResponse(res, "Your cart is empty");

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
    return appapiResponse.successResponseWithData(
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
    return appapiResponse.ErrorResponse(res, error.message);
  }
};

export const appBuyNowCheckout = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id, variant_id = null, promo_code_id = null } = req.body;

    if (!product_id)
      return appapiResponse.ErrorResponse(res, "Product ID is required");

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
      // product: {
      //   id: product.id,
      //   name: product.name,
      //   description: product.short_description || "",
      //   price: parseFloat(originalPrice.toFixed(2)),
      //   selling_price: parseFloat(price.toFixed(2)),
      //   discount,
      //   image:
      //     images.find((img) => img.is_primary)?.image_url ||
      //     images[0]?.image_url ||
      //     null,
      //   category: product.category_id || null,
      //   stockStatus: (variant?.stock || 0) > 0 ? "in" : "out",
      //   onSale: discount > 0,
      //   quantity,
      //   ...(variant && {
      //     variant: {
      //       id: variant.id,
      //       sku: variant.sku,
      //       stock: variant.stock,
      //       attributes:
      //         variant.attributes?.map((attr) => ({
      //           attribute_id: attr.attribute?.id,
      //           attribute_name: attr.attribute?.name,
      //           value_id: attr.attribute_value?.id,
      //           value: attr.attribute_value?.value,
      //         })) || [],
      //       images:
      //         variant.variant_images?.map((img) => ({
      //           id: img.id,
      //           url: img.image_url,
      //           is_primary: img.is_primary,
      //         })) || [],
      //     },
      //   }),
      // },
      total_amount: totalAmount,
      discount_amount: discountAmount,
      final_amount: finalAmount,
      promo_code_id: appliedPromo ? appliedPromo.id : null,
      promo_code: appliedPromo ? appliedPromo.code : null,
      discount_type: appliedPromo ? appliedPromo.discount_type : null,
      discount_value: appliedPromo ? appliedPromo.discount_value : null,
    };

    return appapiResponse.successResponseWithData(
      res,
      "Buy Now checkout calculation successful",
      responseData
    );
  } catch (error) {
    console.error("Error in appBuyNowCheckout:", error);
    return appapiResponse.ErrorResponse(res, error.message);
  }
};

// ============================
export const placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { address_id, payment_id, promo_code_id = null, razorpay_payment_id = null } = req.body;

    if (!address_id) return apiResponse.ErrorResponse(res, "Address ID is required");
    if (!payment_id) return apiResponse.ErrorResponse(res, "Payment ID is required");

    const paymentMethod = await PaymentMethod.findOne({ where: { id: payment_id } });
    if (!paymentMethod) return apiResponse.notFoundResponse(res, "Payment method not found");

    // ✅ Fetch Cart Items
    const cartItems = await Cart.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Product,
          as: "product",
          where: { is_deleted: false },
          attributes: ["id", "name", "category_id", "shop_id"],
          include: [
            {
              model: ProductImage,
              as: "images",
              where: { is_deleted: false },
              required: false,
              attributes: ["image_url", "is_primary"]
            },
          ],
        },
      ],
    });

    if (!cartItems.length) return apiResponse.ErrorResponse(res, "Cart is empty");

    const address = await userAddress.findOne({
      where: { id: address_id, user_id: userId },
    });
    if (!address) return apiResponse.ErrorResponse(res, "Address not found");

    // ✅ Calculate full cart total before splitting
    let grandSubtotal = 0;
    for (const item of cartItems) {
      const variant = await ProductVariant.findOne({
        where: { product_id: item.product_id, is_deleted: false },
        order: [["id", "ASC"]],
      });
      const price = variant ? variant.selling_price : 0;
      grandSubtotal += price * item.quantity;
    }

    const grandTax = parseFloat((grandSubtotal * 0.10).toFixed(2));
    const grandShipping = 0;
    let grandTotal = grandSubtotal + grandTax + grandShipping;

    // ✅ Promo Code Apply Logic
    let discountAmount = 0;
    let appliedPromo = null;

    if (promo_code_id) {
      const promo = await PromoCode.findOne({
        where: { id: promo_code_id, is_active: true, is_deleted: false }
      });

      if (!promo) return apiResponse.ErrorResponse(res, "Invalid or inactive promo code");

      const now = new Date();
      if (promo.valid_from && now < promo.valid_from)
        return apiResponse.ErrorResponse(res, "Promo not active yet");
      if (promo.valid_to && now > promo.valid_to)
        return apiResponse.ErrorResponse(res, "Promo expired");
      if (promo.usage_limit > 0 && promo.used_count >= promo.usage_limit)
        return apiResponse.ErrorResponse(res, "Promo usage limit reached");
      if (promo.min_order_value && grandTotal < promo.min_order_value)
        return apiResponse.ErrorResponse(res, `Minimum order value ₹${promo.min_order_value} required`);

      if (promo.discount_type === "fixed") {
        discountAmount = promo.discount_value;
      } else if (promo.discount_type === "percent") {
        discountAmount = (promo.discount_value / 100) * grandTotal;
        if (promo.max_discount && discountAmount > promo.max_discount) {
          discountAmount = promo.max_discount;
        }
      }

      if (discountAmount > grandTotal) discountAmount = grandTotal;
      appliedPromo = promo;
      grandTotal = grandTotal - discountAmount;
    }

     const estimatedDelivery = new Date();
      estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);
      const formattedDelivery = estimatedDelivery.toISOString().split("T")[0];

    // ✅ Group by Seller
    const groupedBySeller = {};
    for (const item of cartItems) {
      const shopId = item.product.shop_id;
      if (!groupedBySeller[shopId]) groupedBySeller[shopId] = [];
      groupedBySeller[shopId].push(item);
    }

    const allOrders = [];

    // 🏷️ Loop seller-wise and place orders
    for (const [sellerId, itemsList] of Object.entries(groupedBySeller)) {
      let sellerSubtotal = 0;
      let orderItems = [];

      for (const item of itemsList) {
        const variant = await ProductVariant.findOne({
          where: { product_id: item.product_id, is_deleted: false },
          order: [["id", "ASC"]],
        });

        const price = variant ? variant.selling_price : 0;
        sellerSubtotal += price * item.quantity;

        const image =
          item.product.images?.find(x => x.is_primary)?.image_url ||
          item.product.images?.[0]?.image_url ||
          null;

        orderItems.push({
          id: item.product.id,
          name: item.product.name,
          image,
          quantity: item.quantity,
          sellingPrice: price,
        });
      }

      const tax = parseFloat((sellerSubtotal * 0.1).toFixed(2));
      const shipping = 0;
      const sellerTotal = parseFloat((sellerSubtotal + tax + shipping).toFixed(2));

      // ✅ Create Order Row
      const order = await Order.create({
        user_id: userId,
        seller_id: sellerId,
        address_id,
        payment_id,
        razorpay_payment_id,
        subtotal: sellerSubtotal,
        tax,
        shipping,
        total_amount: sellerTotal,
        promo_code_id: appliedPromo ? appliedPromo.id : null, // ✅ save promo here too
        status: "pending",
      });

      // ✅ Insert Order Items
      for (const item of itemsList) {
        const variant = await ProductVariant.findOne({
          where: { product_id: item.product_id, is_deleted: false },
          order: [["id", "ASC"]],
        });

        await OrderItem.create({
          order_id: order.id,
          product_id: item.product_id,
          variant_id: variant ? variant.id : null,
          quantity: item.quantity,
          price: variant ? variant.selling_price : 0,
        });
      }

      allOrders.push({
        orderId: `ORD${order.id}`,
        sellerId,
        subtotal: sellerSubtotal,
        tax,
        shipping,
        totalAmount: sellerTotal,
        estimatedDelivery: formattedDelivery,
        items: orderItems,
      });
    }

    await Cart.destroy({ where: { user_id: userId } });

    return apiResponse.successResponseWithData(res, "Order placed successfully", {
      address,
      paymentMethod,
      subtotal: grandSubtotal,
      tax: grandTax,
      shipping: grandShipping,
      discount: discountAmount,
      totalAmount: grandTotal,
      promo_code: appliedPromo ? appliedPromo.code : null,
      orders: allOrders,
    });

  } catch (err) {
    console.error(err);
    return apiResponse.ErrorResponse(res, err.message);
  }
};



// ============================
export const getOrderHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.findAll({
      where: { user_id: userId },
      include: [
        {
          model: OrderItem,
          as: "items",
          attributes: ["id", "quantity", "price"],
          include: [
            {
              model: Product,
              as: "product",
              required: false,
              attributes: ["id", "name", "short_description", "brand"],
              include: [
                {
                  model: ProductImage,
                  as: "images",
                  where: { is_deleted: false },
                  required: false,
                  attributes: ["image_url", "is_primary"],
                  limit: 1,
                  order: [["is_primary", "DESC"]],
                },
              ],
            },
            {
              model: ProductVariant,
              as: "variant",
              where: { is_deleted: false },
              required: false,
              include: [
                {
                  model: ProductVariantAttributeValue,
                  as: "attributes",
                  include: [
                    { model: Attribute, as: "attribute", attributes: ["id", "name", "input_type"] },
                    { model: AttributeValue, as: "attribute_value", attributes: ["id", "value"] },
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
        { model: userAddress, as: "address", required: false },
        { model: PaymentMethod, as: "payment_method", attributes: ["name"], required: false },
      ],
      order: [["createdAt", "DESC"]],
    });

    const transformedOrders = orders.map((order) => ({
      ...order.toJSON(),
      subtotal: order.subtotal ?? 0,
      shipping: order.shipping ?? 0,
      tax: order.tax ?? 0,
      promo_code: order.promo_code ?? null,
      total_amount: order.total_amount ?? 0,
      payment_name: order.payment_method ? order.payment_method.name : null, // direct payment_name
      items: order.items.map((item) => {
        const product = item.product
          ? {
              ...item.product.toJSON(),
              image:
                item.product.images && item.product.images.length > 0
                  ? item.product.images[0].image_url
                  : null,
            }
          : null;

        if (product) delete product.images;

        return { ...item.toJSON(), product };
      }),
      address: order.address ? order.address.toJSON() : null,
    }));

    return apiResponse.successResponseWithData(res, "Order history", transformedOrders);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};


export const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({
      where: { id, user_id: userId },
      include: [
        {
          model: OrderItem,
          as: "items",
          attributes: ["id", "quantity", "price"],
          include: [
            {
              model: Product,
              as: "product",
              required: false,
              attributes: ["id", "name", "short_description", "brand"],
              include: [
                {
                  model: ProductImage,
                  as: "images",
                  where: { is_deleted: false },
                  required: false,
                  attributes: ["image_url", "is_primary"],
                  limit: 1,
                  order: [["is_primary", "DESC"]],
                },
              ],
            },
            {
              model: ProductVariant,
              as: "variant",
              where: { is_deleted: false },
              required: false,
              include: [
                {
                  model: ProductVariantAttributeValue,
                  as: "attributes",
                  include: [
                    { model: Attribute, as: "attribute", attributes: ["id", "name", "input_type"] },
                    { model: AttributeValue, as: "attribute_value", attributes: ["id", "value"] },
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
        { model: userAddress, as: "address", required: false },
        { model: PaymentMethod, as: "payment_method", attributes: ["name"], required: false },
      ],
    });

    if (!order) return apiResponse.notFoundResponse(res, "Order not found", null);

    const transformedOrder = {
      ...order.toJSON(),
      subtotal: order.subtotal ?? 0,
      shipping: order.shipping ?? 0,
      tax: order.tax ?? 0,
      promo_code: order.promo_code ?? null,
      total_amount: order.total_amount ?? 0,
      payment_name: order.payment_method ? order.payment_method.name : null, // direct payment_name
      items: order.items.map((item) => {
        const product = item.product
          ? {
              ...item.product.toJSON(),
              image:
                item.product.images && item.product.images.length > 0
                  ? item.product.images[0].image_url
                  : null,
            }
          : null;

        if (product) delete product.images;

        return { ...item.toJSON(), product };
      }),
      address: order.address ? order.address.toJSON() : null,
    };

    return apiResponse.successResponseWithData(res, "Order details", transformedOrder);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { order_id,cancel_reasons } = req.body;

    if (!order_id) return apiResponse.ErrorResponse(res, "Order ID is required");

    const order = await Order.findOne({
      where: { id: order_id, user_id: userId },
    });

    if (!order) return apiResponse.notFoundResponse(res, "Order not found");

    // 🚫 Restrict cancel if already shipped/delivered/cancelled
    if (["shipped", "delivered", "cancelled"].includes(order.status)) {
      return apiResponse.ErrorResponse(
        res,
        `Order cannot be cancelled (current status: ${order.status})`
      );
    }

    // ✅ Update status
    order.status = "cancelled";
    order.cancel_reasons=cancel_reasons;
    await order.save();

    return apiResponse.successResponseWithData(res, "Order cancelled successfully");
  } catch (error) {
    console.error(error);
    return apiResponse.ErrorResponse(res, error.message);
  }
};

export const reorder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { order_id } = req.body;

    if (!order_id) 
      return apiResponse.ErrorResponse(res, "Order ID is required");

    // ✅ Find old order
    const oldOrder = await Order.findOne({
      where: { id: order_id, user_id: userId },
      include: [{ model: OrderItem, as: "items" }],
    });

    if (!oldOrder) 
      return apiResponse.notFoundResponse(res, "Original order not found");
    // ✅ Add items to cart
    const cartItems = oldOrder.items.map((item) => ({
      user_id: userId,
      product_id: item.product_id,
      variant_id: item.variant_id,
      quantity: item.quantity
    }));

    await Cart.bulkCreate(cartItems);

    return apiResponse.successResponseWithData(
      res,
      "Items added to cart for reorder",
      { cart_count: cartItems.length }
    );
  } catch (error) {
    console.error(error);
    return apiResponse.ErrorResponse(res, error.message);
  }
};


// ============================
// 📱 APP - Place Order
// ============================
export const appplaceOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { address_id, payment_id, razorpay_payment_id = null } = req.body;

    // ✅ Validate inputs
    if (!address_id) return appapiResponse.ErrorResponse(res, "Address ID is required");
    if (!payment_id) return appapiResponse.ErrorResponse(res, "Payment type is required");

    // ✅ Get all cart items with related product + variant info
    const cartItems = await Cart.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "name", "shop_id"],
        },
        {
          model: ProductVariant,
          as: "variant",
          required: false,
          attributes: ["id", "price", "selling_price", "shipping_cost"],
        },
      ],
    });

    if (!cartItems.length) {
      return appapiResponse.ErrorResponse(res, "Cart is empty");
    }

    // ✅ Group items by seller (shop_id)
    const itemsBySeller = {};
    for (const item of cartItems) {
      const sellerId = item.product.shop_id;
      if (!itemsBySeller[sellerId]) itemsBySeller[sellerId] = [];
      itemsBySeller[sellerId].push(item);
    }

    const allOrders = [];

    // ✅ Process each seller group
    for (const [sellerId, sellerItems] of Object.entries(itemsBySeller)) {
      let subtotal = 0;
      let totalShipping = 0;

      // ✅ Calculate totals for this seller
      for (const item of sellerItems) {
        const variant = item.variant
          ? item.variant
          : await ProductVariant.findOne({
              where: { product_id: item.product_id },
              order: [["id", "ASC"]],
            });

        const sellingPrice = parseFloat(variant?.selling_price || 0);
        const shippingCost = parseFloat(variant?.shipping_cost || 0);

        subtotal += sellingPrice * item.quantity;
        totalShipping += shippingCost * item.quantity;
      }

      const tax = parseFloat((subtotal * 0.1).toFixed(2)); // 10% tax example
      const totalAmount = subtotal + tax + totalShipping;

      // ✅ Create the main order record
      const order = await Order.create({
        user_id: userId,
        seller_id: sellerId,
        address_id,
        payment_id,
        razorpay_payment_id,
        subtotal,
        tax,
        shipping: totalShipping,
        total_amount: totalAmount,
        status: "pending",
      });

      // ✅ Create order items for this seller
      const orderItems = [];
      for (const item of sellerItems) {
        const variant = item.variant
          ? item.variant
          : await ProductVariant.findOne({
              where: { product_id: item.product_id },
              order: [["id", "ASC"]],
            });

        const variantId = variant?.id || null;
        const price = parseFloat(variant?.price || 0);
        const sellingPrice = parseFloat(variant?.selling_price || 0);
        const shippingCost = parseFloat(variant?.shipping_cost || 0);

        orderItems.push({
          order_id: order.id,
          product_id: item.product_id,
          variant_id: variantId,
          quantity: item.quantity,
          price,
          selling_price: sellingPrice,
          shipping_cost: shippingCost,
        });
      }

      await OrderItem.bulkCreate(orderItems);
      allOrders.push(order);
    }

    // ✅ Clear user cart after all orders are created
    await Cart.destroy({ where: { user_id: userId } });

    // ✅ Return response
    return appapiResponse.successResponseWithData(
      res,
      "Orders placed successfully (seller-wise)",
      allOrders
    );
  } catch (err) {
    console.error(err);
    return appapiResponse.ErrorResponse(res, err.message);
  }
};

// ============================
// 📱 APP - Order History
// ============================
export const appgetOrderHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    // ✅ Fetch orders and include products + their first image
    const orders = await Order.findAll({
      where: { user_id: userId },
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              include: [
                {
                  model: ProductImage,
                  as: "images",
                  where: { is_deleted: false },
                  required: false,
                  attributes: ["id", "image_url", "is_primary"],
                  order: [["is_primary", "DESC"]],
                  limit: 1,
                },
              ],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // ✅ Transform response: keep only first image as product.image
    const formattedOrders = orders.map(order => ({
      ...order.toJSON(),
      items: order.items.map(item => {
        const product = item.product ? item.product.toJSON() : null;
        if (product) {
          product.image = product.images?.length ? product.images[0].image_url : null;
          delete product.images; // remove the images array
        }
        return { ...item.toJSON(), product };
      }),
    }));

    return appapiResponse.successResponseWithData(res, "Order history", formattedOrders);
  } catch (err) {
    return appapiResponse.ErrorResponse(res, err.message);
  }
};


// ============================
// 📱 APP - Order Details
// ============================
export const appgetOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({
      where: { id, user_id: userId },
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [{ model: Product, as: "product" }],
        },
      ],
    });

    if (!order) {
      return appapiResponse.ErrorResponse(res, "Order not found");
    }

    return appapiResponse.successResponseWithData(res, "Order details", order);
  } catch (err) {
    return appapiResponse.ErrorResponse(res, err.message);
  }
};


export const appcancelOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { order_id } = req.body;

    if (!order_id) return appapiResponse.ErrorResponse(res, "Order ID is required");

    const order = await Order.findOne({
      where: { id: order_id, user_id: userId },
    });

    if (!order) return appapiResponse.notFoundResponse(res, "Order not found");

    // 🚫 Restrict cancel if already shipped/delivered/cancelled
    if (["shipped", "delivered", "cancelled"].includes(order.status)) {
      return appapiResponse.ErrorResponse(
        res,
        `Order cannot be cancelled (current status: ${order.status})`
      );
    }

    // ✅ Update status
    order.status = "cancelled";
    await order.save();

    return appapiResponse.successResponse(res, "Order cancelled successfully");
  } catch (error) {
    console.error(error);
    return appapiResponse.ErrorResponse(res, error.message);
  }
};

export const appreorder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { order_id,address_id,payment_id,razorpay_payment_id=null } = req.body;

    if (!order_id) return appapiResponse.ErrorResponse(res, "Order ID is required");

    const oldOrder = await Order.findOne({
      where: { id: order_id, user_id: userId },
      include: [{ model: OrderItem, as: "items" }],
    });

    if (!oldOrder) return appapiResponse.notFoundResponse(res, "Original order not found");

    // ✅ Create new order with pending status
    const newOrder = await Order.create({
      user_id: userId,
      address_id: address_id,
      payment_id: payment_id,
      total_amount: oldOrder.total_amount,
      subtotal: oldOrder.subtotal,
      tax: oldOrder.tax,
      shipping: oldOrder.shipping,
      status: "pending",
      razorpay_payment_id: razorpay_payment_id,
    });

    // ✅ Duplicate order items
    const newOrderItems = oldOrder.items.map((item) => ({
      order_id: newOrder.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      quantity: item.quantity,
      price: item.price,
    }));

    await OrderItem.bulkCreate(newOrderItems);

    return appapiResponse.successResponseWithData(
      res,
      "Reorder created successfully",
      { new_order_id: newOrder.id }
    );
  } catch (error) {
    console.error(error);
    return appapiResponse.ErrorResponse(res, error.message);
  }
};