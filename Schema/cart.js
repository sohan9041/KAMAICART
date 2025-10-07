// models/Cart.js
import { DataTypes } from "sequelize";
import { sequelize } from "../Config/connectDb.js";
import Product from "./product.js";
import ProductVariant from "./productVariant.js";

const Cart = sequelize.define(
  "Cart",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    variant_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
  },
  {
    tableName: "cart",
    timestamps: true,
  }
);

// Associations
Cart.belongsTo(Product, { foreignKey: "product_id", as: "product" });
Cart.belongsTo(ProductVariant, { foreignKey: "variant_id", as: "variant" });

export default Cart;
