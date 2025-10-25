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

    const paymentMethod = await PaymentMethod.findOne({
      where: { id: payment_id },
      attributes: ["id", "name", "mode", "image"],
    });

    if (!paymentMethod) return apiResponse.notFoundResponse(res, "Payment method not found");

    // 🛒 Fetch cart items
    const cartItems = await Cart.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Product,
          as: "product",
          where: { is_deleted: false },
          attributes: ["id", "name", "short_description", "category_id", "shop_id"],
          include: [
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
          ],
        },
      ],
    });

    if (!cartItems.length) return apiResponse.ErrorResponse(res, "Cart is empty");

    const address = await userAddress.findOne({
      where: { id: address_id, user_id: userId },
    });

    if (!address) return apiResponse.ErrorResponse(res, "Address not found");

    // 🧩 Group items by seller/shop_id
    const groupedBySeller = {};
    for (const item of cartItems) {
      const shopId = item.product.shop_id;
      if (!groupedBySeller[shopId]) groupedBySeller[shopId] = [];
      groupedBySeller[shopId].push(item);
    }

    const allOrders = [];

    for (const [sellerId, itemsList] of Object.entries(groupedBySeller)) {
      let subtotal = 0;
      const orderItemsData = [];

      for (const item of itemsList) {
        const variantData = item.variant || null;
        let price = 0;

        if (variantData) price = variantData.selling_price;
        else {
          const firstVariant = await ProductVariant.findOne({
            where: { product_id: item.product_id, is_deleted: false },
            order: [["id", "ASC"]],
          });
          if (firstVariant) price = firstVariant.selling_price;
        }

        subtotal += price * item.quantity;

        orderItemsData.push({
          product_id: item.product_id,
          variant_id: item.variant_id || variantData?.id || null,
          quantity: item.quantity,
          price,
        });
      }

      const tax = parseFloat((subtotal * 0.1).toFixed(2));
      const shipping = 0;
      const totalAmount = parseFloat((subtotal + tax + shipping).toFixed(2));

      // 🧾 Create order per seller
      const order = await Order.create({
        user_id: userId,
        seller_id: sellerId, // ✅ New column
        address_id,
        payment_id,
        razorpay_payment_id,
        subtotal,
        tax,
        shipping,
        total_amount: totalAmount,
        status: "pending",
      });

      // 🧾 Add order items
      const orderItems = orderItemsData.map((oi) => ({
        ...oi,
        order_id: order.id,
      }));
      await OrderItem.bulkCreate(orderItems);

      allOrders.push({
        orderId: order.id,
        sellerId,
        subtotal,
        tax,
        shipping,
        totalAmount,
        items: orderItemsData,
      });
    }

    // 🧹 Clear cart
    await Cart.destroy({ where: { user_id: userId } });

    return res.status(200).json({
      success: true,
      message: "Orders placed successfully (seller-wise)",
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

    // ✅ Get all cart items (include products and variants)
    const cartItems = await Cart.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "name", "price", "shop_id"],
        },
        {
          model: ProductVariant,
          as: "variant",
          required: false,
          attributes: ["id", "selling_price", "original_price"],
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

    // ✅ Loop each seller group
    for (const [sellerId, sellerItems] of Object.entries(itemsBySeller)) {
      let subtotal = 0;

      // Calculate total for this seller
      for (const item of sellerItems) {
        const price =
          item.variant?.selling_price ||
          (await ProductVariant.findOne({
            where: { product_id: item.product_id },
            order: [["id", "ASC"]],
          }))?.selling_price ||
          item.product.price;

        subtotal += price * item.quantity;
      }

      const tax = parseFloat((subtotal * 0.1).toFixed(2));
      const shipping = 0;
      const totalAmount = subtotal + tax + shipping;

      // ✅ Create seller-wise order
      const order = await Order.create({
        user_id: userId,
        seller_id: sellerId, // ✅ add seller_id
        address_id,
        payment_id,
        razorpay_payment_id,
        subtotal,
        tax,
        shipping,
        total_amount: totalAmount,
        status: "pending",
      });

      // ✅ Add order items
      const orderItems = [];

      for (const item of sellerItems) {
        const variantId = item.variant_id
          ? item.variant_id
          : (
              await ProductVariant.findOne({
                where: { product_id: item.product_id },
                order: [["id", "ASC"]],
              })
            )?.id || null;

        const price =
          item.variant?.selling_price ||
          (await ProductVariant.findOne({
            where: { id: variantId },
          }))?.selling_price ||
          item.product.price;

        orderItems.push({
          order_id: order.id,
          product_id: item.product_id,
          variant_id: variantId,
          quantity: item.quantity,
          price,
        });
      }

      await OrderItem.bulkCreate(orderItems);
      allOrders.push(order);
    }

    // ✅ Clear user cart after all orders
    await Cart.destroy({ where: { user_id: userId } });

    // ✅ Response
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