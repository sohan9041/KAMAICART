import { DataTypes } from "sequelize";
import { sequelize } from "../Config/connectDb.js";
import UserAddress from "./userAddress.js";
import PaymentMethod from "./paymentMethod.js";
import { User } from "./user.js";

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
    seller_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    subtotal: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    shipping: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    tax: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    total_amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    promo_code: {
      type: DataTypes.STRING,
      allowNull: true,
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
    },
    cancel_reasons: {
      type: DataTypes.TEXT,
      allowNull: true,
    }
  },
  {
    tableName: "orders",
    timestamps: true,
  }
);

Order.belongsTo(UserAddress, { foreignKey: "address_id", as: "address" });
Order.belongsTo(PaymentMethod, {
  foreignKey: "payment_id",
  as: "payment_method",
});
Order.belongsTo(User, { foreignKey: "user_id", as: "user" });

export default Order;
