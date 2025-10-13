import { DataTypes } from "sequelize";
import { sequelize } from "../Config/connectDb.js";

const PaymentMethod = sequelize.define(
  "PaymentMethod",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false, // e.g. "Razorpay", "Cash on Delivery"
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true, // e.g. image URL or uploaded file path
      get() {
        const rawValue = this.getDataValue("image");
        if (!rawValue) return null;
        return `${process.env.BASE_URL}${rawValue}`;
      },
    },
    mode: {
      type: DataTypes.ENUM("test", "live"),
      allowNull: false,
      defaultValue: "test", // Default mode
    },
    key_id: {
      type: DataTypes.STRING,
      allowNull: true, // For payment gateways (null for COD)
    },
    key_secret: {
      type: DataTypes.STRING,
      allowNull: true, // For payment gateways (null for COD)
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true, // Method is available by default
    }
  },
  {
    tableName: "payment_methods",
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

export default PaymentMethod;
