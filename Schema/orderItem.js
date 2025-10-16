// models/OrderItem.js
import { DataTypes } from "sequelize";
import { sequelize } from "../Config/connectDb.js";
import Product from "./product.js";
import Order from "./order.js";
import ProductVariant from "./productVariant.js";

const OrderItem = sequelize.define(
  "OrderItem",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    variant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    tableName: "order_items",
    timestamps: true,
  }
);

// Associations
Order.hasMany(OrderItem, { foreignKey: "order_id", as: "items" });
OrderItem.belongsTo(Order, { foreignKey: "order_id" });
OrderItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });
OrderItem.belongsTo(ProductVariant, { foreignKey: "variant_id", as: "variant" });


export default OrderItem;
