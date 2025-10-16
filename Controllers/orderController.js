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
import {ProductImage} from "../Models/productImageModel.js";
import { PaymentMethod } from "../Models/paymentMethodModel.js";


// ============================
export const placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { address_id, payment_id, razorpay_payment_id = null } = req.body;

    if (!address_id) return apiResponse.ErrorResponse(res, "Address ID is required");
    if (!payment_id) return apiResponse.ErrorResponse(res, "Payment ID is required");

    // 🧾 Fetch payment method details
    const paymentMethod = await PaymentMethod.findOne({
      where: { id: payment_id },
      attributes: ["id", "name", "mode", "image"],
    });

    if (!paymentMethod) {
      return apiResponse.notFoundResponse(res, "Payment method not found");
    }

    // 🛒 Get cart items
    const cartItems = await Cart.findAll({
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
    });

    if (!cartItems.length) return apiResponse.ErrorResponse(res, "Cart is empty");

    let subtotal = 0;
    const items = [];

    for (const item of cartItems) {
      let price = 0;
      let originalPrice = 0;
      let variantData = item.variant || null;

      // ✅ Determine price
      if (variantData) {
        price = variantData.selling_price;
        originalPrice = variantData.original_price;
      } else {
        const firstVariant = await ProductVariant.findOne({
          where: { product_id: item.product_id, is_deleted: false },
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
          order: [["id", "ASC"]],
        });
        if (firstVariant) {
          variantData = firstVariant;
          price = firstVariant.selling_price;
          originalPrice = firstVariant.original_price;
        }
      }

      subtotal += price * item.quantity;

      // ✅ Pick best image
      let primaryImage = null;
      if (variantData?.variant_images?.length) {
        const variantPrimary = variantData.variant_images.find((img) => img.is_primary);
        primaryImage = variantPrimary
          ? variantPrimary.image_url
          : variantData.variant_images[0]?.image_url || null;
      }
      if (!primaryImage && item.product?.images?.length) {
        const productPrimary = item.product.images.find((img) => img.is_primary);
        primaryImage = productPrimary
          ? productPrimary.image_url
          : item.product.images[0]?.image_url || null;
      }
      if (!primaryImage && item.product?.variants?.length) {
        for (const v of item.product.variants) {
          if (v.variant_images?.length) {
            const img = v.variant_images.find((i) => i.is_primary) || v.variant_images[0];
            if (img) {
              primaryImage = img.image_url;
              break;
            }
          }
        }
      }

      items.push({
        id: item.product_id,
        name: item.product.name,
        image: primaryImage,
        quantity: item.quantity,
        sellingPrice: price,
        originalPrice: originalPrice,
        variant: variantData
          ? {
              id: variantData.id,
              attributes: variantData.attributes?.map((a) => ({
                id: a.id,
                name: a.attribute.name,
                value: a.attribute_value.value,
              })),
            }
          : null,
      });
    }

    // ✅ Totals
    const tax = parseFloat((subtotal * 0.1).toFixed(2)); // 10%
    const shipping = 0;
    const totalAmount = parseFloat((subtotal + tax + shipping).toFixed(2));

    // ✅ Address
    const address = await userAddress.findOne({
      where: { id: address_id, user_id: userId },
    });

    // ✅ Create order
    const order = await Order.create({
      user_id: userId,
      address_id,
      payment_id,
      total_amount: totalAmount,
      razorpay_payment_id: razorpay_payment_id,
      subtotal,
      tax,
      shipping,
      status: "pending",
    });

    // ✅ Order items
    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      variant_id: item.variant_id || (item.variant ? item.variant.id : null),
      quantity: item.quantity,
      price: items.find((i) => i.id === item.product_id).sellingPrice,
    }));
    await OrderItem.bulkCreate(orderItems);

    // ✅ Clear cart
    await Cart.destroy({ where: { user_id: userId } });

    // ✅ Response
    return res.status(200).json({
      success: true,
      order: {
        orderId: order.id,
        paymentMethod: {
          id: paymentMethod.id,
          name: paymentMethod.name,
          mode: paymentMethod.mode,
          image: paymentMethod.image,
        },
        totalAmount,
        subtotal,
        shipping,
        tax,
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toDateString(),
        address,
        items,
      },
      message: "Order created successfully",
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
    const { order_id } = req.body;

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
    const { address_id, payment_id,razorpay_payment_id=null } = req.body;

    // ✅ Validate input
    if (!address_id) {
      return appapiResponse.ErrorResponse(res, "Address ID is required");
    }
    if (!payment_id) {
      return appapiResponse.ErrorResponse(res, "Payment type is required");
    }

    // ✅ Get cart items (include variants if any)
    const cartItems = await Cart.findAll({
      where: { user_id: userId },
      include: [
        { model: Product, as: "product" },
        { model: ProductVariant, as: "variant", required: false }, // optional variant
      ],
    });

    if (!cartItems.length) {
      return appapiResponse.ErrorResponse(res, "Cart is empty");
    }

    // ✅ Calculate total with variant logic
    let totalAmount = 0;

    for (const item of cartItems) {
      let sellingPrice = 0;

      if (item.variant_id && item.variant) {
        // Use variant’s selling price if exists
        sellingPrice = item.variant.selling_price;
      } else {
        // No variant_id → get the first variant of the product
        const firstVariant = await ProductVariant.findOne({
          where: { product_id: item.product_id },
          order: [["id", "ASC"]],
        });

        sellingPrice = firstVariant
          ? firstVariant.selling_price
          : item.product.price; // fallback
      }

      totalAmount += item.quantity * sellingPrice;
    }

    // ✅ Create order
    const order = await Order.create({
      user_id: userId,
      address_id,
      payment_id,
      total_amount: totalAmount,
      razorpay_payment_id:razorpay_payment_id,
      status: "pending",
    });

    // ✅ Create order items
    const orderItems = [];

    for (const item of cartItems) {
      let sellingPrice = 0;

      if (item.variant_id && item.variant) {
        sellingPrice = item.variant.selling_price;
      } else {
        const firstVariant = await ProductVariant.findOne({
          where: { product_id: item.product_id },
          order: [["id", "ASC"]],
        });

        sellingPrice = firstVariant
          ? firstVariant.selling_price
          : item.product.price;
      }

      orderItems.push({
        order_id: order.id,
        product_id: item.product_id,
        variant_id: item.variant_id || (firstVariant ? firstVariant.id : null),
        quantity: item.quantity,
        price: sellingPrice,
      });
    }

    await OrderItem.bulkCreate(orderItems);

    // ✅ Clear user cart
    await Cart.destroy({ where: { user_id: userId } });

    // ✅ Return response
    return appapiResponse.successResponseWithData(
      res,
      "Order placed successfully",
      order
    );
  } catch (err) {
    return appapiResponse.ErrorResponse(res, err.message);
  }
};

// ============================
// 📱 APP - Order History
// ============================
export const appgetOrderHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.findAll({
      where: { user_id: userId },
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [{ model: Product, as: "product" }],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return appapiResponse.successResponseWithData(res, "Order history", orders);
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