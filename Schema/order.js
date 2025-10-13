// models/Order.js
import { DataTypes } from "sequelize";
import { sequelize } from "../Config/connectDb.js";
import UserAddress from "./userAddress.js";

const Order = sequelize.define(
  "Order",
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
    total_amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "confirmed", "shipped", "delivered", "cancelled"),
      defaultValue: "pending",
    },
    address_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: UserAddress,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    payment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    razorpay_payment_id: {
      type: DataTypes.TEXT,
      allowNull: true,
    }
  },
  {
    tableName: "orders",
    timestamps: true,
  }
);

export default Order;
