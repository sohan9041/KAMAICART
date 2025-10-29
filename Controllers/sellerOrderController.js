import Order from "../Schema/order.js";
import OrderItem from "../Schema/orderItem.js";
import Product from "../Schema/product.js";
import ProductVariant from "../Schema/productVariant.js";
import ProductImage from "../Schema/productImage.js";
import ProductVariantAttributeValue from "../Schema/productVariantAttributeValue.js";
import Attribute from "../Schema/attribute.js";
import AttributeValue from "../Schema/attributeValue.js";
import UserAddress from "../Schema/userAddress.js";
import PaymentMethod from "../Schema/paymentMethod.js";
import apiResponse from "../Helper/apiResponse.js";
import { User } from "../Schema/user.js";
import { Op } from "sequelize";

export const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    if (!sellerId) {
      return apiResponse.ErrorResponse(res, "Seller ID is required");
    }

    const { search, status, fromDate, toDate } = req.query;

    // 🔹 Base filter
    const orderWhere = { seller_id: sellerId };

    if (status) orderWhere.status = status;

    if (fromDate || toDate) {
      orderWhere.createdAt = {};
      if (fromDate) orderWhere.createdAt[Op.gte] = new Date(fromDate);
      if (toDate) orderWhere.createdAt[Op.lte] = new Date(toDate);
    }

    // 🔹 Search filter
    let userIncludeWhere = undefined;
    if (search) {
      if (!isNaN(search)) {
        // Numeric → Order ID
        orderWhere.id = search;
      } else {
        // Text → User name / email / phone
        userIncludeWhere = {
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { email: { [Op.iLike]: `%${search}%` } },
            { phoneno: { [Op.iLike]: `%${search}%` } },
          ],
        };
      }
    }

    // 🔹 Fetch orders
    const { count, rows: orders } = await Order.findAndCountAll({
      where: orderWhere,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "phoneno"],
          required: !!userIncludeWhere,
          where: userIncludeWhere,
        },
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "brand"],
              include: [
                {
                  model: ProductImage,
                  as: "images",
                  required: false,
                  attributes: ["image_url"],
                },
                {
                  model: ProductVariant,
                  as: "variants",
                  required: false,
                  attributes: ["id"],
                  include: [
                    {
                      model: ProductVariantAttributeValue,
                      as: "attributes",
                      include: [
                        {
                          model: Attribute,
                          as: "attribute",
                          attributes: ["name"],
                        },
                        {
                          model: AttributeValue,
                          as: "attribute_value",
                          attributes: ["value"],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          model: UserAddress,
          as: "address",
        },
        {
          model: PaymentMethod,
          as: "payment_method",
          attributes: ["name"],
        },
      ],
      limit,
      offset,
      distinct: true,
      order: [["createdAt", "DESC"]],
    });

    if (!orders.length) {
      return apiResponse.successResponseWithData(res, "No orders found", []);
    }

    // 🔹 Format response
    const formattedOrders = orders.map((order) => {
      const items = order.items.map((item) => {
        const product = item.product || {};
        const firstImage = product.images?.[0]?.image_url || null;
        const variantAttributes = product.variants?.[0]?.attributes || [];
        const variantValue =
          variantAttributes.map((attr) => attr.attribute_value?.value).join(", ") || null;

        return {
          id: item.id,
          productName: product.name,
          productImage: firstImage,
          variant: variantValue,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
        };
      });

      return {
        id: order.id,
        orderNumber: order.order_number || `ORD-${order.id}`,
        customer: {
          name: order.user?.name || "",
          email: order.user?.email || "",
          phone: order.user?.phoneno || "",
        },
        items,
        itemsCount: items.length,
        totalAmount: order.total_amount || 0,
        orderDate: order.createdAt,
        orderStatus: order.status,
        paymentStatus: order.payment_status || "paid",
        paymentMethod: order.payment_method?.name || "",
        shippingAddress: order.address || {},
        subtotal: order.subtotal || 0,
        shippingCharge: order.shipping_charge || 0,
        taxAmount: order.tax_amount || 0,
        grandTotal: order.grand_total || 0,
      };
    });

    return apiResponse.successResponseWithData(
      res,
      "Seller orders fetched successfully",
      formattedOrders,
      {
        totalOrders: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        pageSize: limit,
      }
    );
  } catch (error) {
    console.error("Error fetching seller orders:", error);
    return apiResponse.ErrorResponse(res, error.message);
  }
};



export const getSellerOrderById = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { orderId } = req.params;

    if (!sellerId) {
      return apiResponse.ErrorResponse(res, "Seller ID is required");
    }

    if (!orderId) {
      return apiResponse.ErrorResponse(res, "Order ID is required");
    }

    // 🔹 Fetch order with all associations
    const order = await Order.findOne({
      where: { id: orderId, seller_id: sellerId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "phoneno"],
        },
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "brand"],
              include: [
                {
                  model: ProductImage,
                  as: "images",
                  required: false,
                  attributes: ["image_url"],
                },
                {
                  model: ProductVariant,
                  as: "variants",
                  required: false,
                  attributes: ["id"],
                  include: [
                    {
                      model: ProductVariantAttributeValue,
                      as: "attributes",
                      include: [
                        {
                          model: Attribute,
                          as: "attribute",
                          attributes: ["name"],
                        },
                        {
                          model: AttributeValue,
                          as: "attribute_value",
                          attributes: ["value"],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        { model: UserAddress, as: "address" },
        { model: PaymentMethod, as: "payment_method", attributes: ["name"] },
      ],
    });

    if (!order) {
      return apiResponse.ErrorResponse(res, "Order not found");
    }

    // 🔹 Format response like your example
    const items = order.items.map((item) => {
      const product = item.product || {};
      const firstImage = product.images?.[0]?.image_url || null;

      const variantAttributes = product.variants?.[0]?.attributes || [];
      const variantValue =
        variantAttributes.map((attr) => attr.attribute_value?.value).join(", ") || null;

      return {
        id: item.id,
        productName: product.name,
        productImage: firstImage,
        variant: variantValue,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
      };
    });

    const formattedOrder = {
      id: order.id,
      orderNumber: order.order_number || `ORD-${order.id}`,
      customer: {
        name: order.user?.name || "",
        email: order.user?.email || "",
        phone: order.user?.phoneno || "",
      },
      items,
      itemsCount: items.length,
      totalAmount: order.total_amount || 0,
      orderDate: order.createdAt,
      orderStatus: order.status,
      paymentStatus: order.payment_status || "paid",
      paymentMethod: order.payment_method?.name || "",
      shippingAddress: order.address || {},
      subtotal: order.subtotal || 0,
      shippingCharge: order.shipping_charge || 0,
      taxAmount: order.tax_amount || 0,
      grandTotal: order.grand_total || 0,
    };

    return apiResponse.successResponseWithData(
      res,
      "Order fetched successfully",
      formattedOrder
    );
  } catch (error) {
    console.error("Error fetching order details:", error);
    return apiResponse.ErrorResponse(res, error.message);
  }
};


export const updateOrderStatus = async (req, res) => {
  try {
    const sellerId = req.user.id; // logged-in seller
    const { orderId, status } = req.body;

    // ✅ Validate inputs
    if (!orderId) return apiResponse.ErrorResponse(res, "Order ID is required");
    if (!status) return apiResponse.ErrorResponse(res, "Status is required");

    const allowedStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled","return_completed","return_requested"];
    if (!allowedStatuses.includes(status)) {
      return apiResponse.ErrorResponse(res, "Invalid status value");
    }

    // ✅ Find the order and ensure it belongs to this seller
    const order = await Order.findOne({ where: { id: orderId, seller_id: sellerId } });
    if (!order) return apiResponse.ErrorResponse(res, "Order not found or does not belong to this seller");

    // ✅ Update order status
    order.status = status;
    await order.save();

    return apiResponse.successResponseWithData(
      res,
      "Order status updated successfully",
      order
    );
  } catch (error) {
    console.error("Error updating order status:", error);
    return apiResponse.ErrorResponse(res, error.message);
  }
};

