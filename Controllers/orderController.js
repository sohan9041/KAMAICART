import { Order } from "../Models/orderModel.js";
import {OrderItem} from "../Models/orderItemModel.js";
import {Cart} from "../Models/cartModel.js";
import {Product} from "../Models/productModel.js";
import apiResponse from "../Helper/apiResponse.js";
import appapiResponse from "../Helper/appapiResponse.js";


// Place Order
export const placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    // get cart items
    const cartItems = await Cart.findAll({
      where: { user_id: userId },
      include: [{ model: Product, as: "product" }],
    });

    if (!cartItems.length) {
      return apiResponse.ErrorResponse(res, "Cart is empty");
    }

    // calculate total
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.quantity * item.product.price,
      0
    );

    // create order
    const order = await Order.create({ user_id: userId, total_amount: totalAmount });

    // create order items
    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.product.price,
    }));
    await OrderItem.bulkCreate(orderItems);

    // clear cart
    await Cart.destroy({ where: { user_id: userId } });

    return apiResponse.successResponseWithData(res, "Order placed successfully", order);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// Order History
export const getOrderHistory = async (req, res) => {
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

    return apiResponse.successResponseWithData(res, "Order history", orders);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// Order Details
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
          include: [{ model: Product, as: "product" }],
        },
      ],
    });

    if (!order) {
      return apiResponse.ErrorResponse(res, "Order not found");
    }

    return apiResponse.successResponseWithData(res, "Order details", order);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// Place Order
export const appplaceOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    // get cart items
    const cartItems = await Cart.findAll({
      where: { user_id: userId },
      include: [{ model: Product, as: "product" }],
    });

    if (!cartItems.length) {
      return appapiResponse.ErrorResponse(res, "Cart is empty");
    }

    // calculate total
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.quantity * item.product.price,
      0
    );

    // create order
    const order = await Order.create({ user_id: userId, total_amount: totalAmount });

    // create order items
    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.product.price,
    }));
    await OrderItem.bulkCreate(orderItems);

    // clear cart
    await Cart.destroy({ where: { user_id: userId } });

    return appapiResponse.successResponseWithData(res, "Order placed successfully", order);
  } catch (err) {
    return appapiResponse.ErrorResponse(res, err.message);
  }
};

// Order History
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

// Order Details
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
