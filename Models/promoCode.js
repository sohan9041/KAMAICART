import { DataTypes } from "sequelize";
import { sequelize } from "../Config/connectDb.js";

export const PromoCode = sequelize.define(
  "PromoCode",
  {
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    discount_type: {
      type: DataTypes.ENUM("percentage", "fixed"),
      allowNull: false,
    },
    discount_value: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    min_order_value: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    max_discount: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    usage_limit: {
      type: DataTypes.INTEGER,
      defaultValue: 0, // 0 = unlimited
    },
    used_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    valid_from: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    valid_to: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "promo_codes", // ✅ Explicit table name in PostgreSQL
    timestamps: true, // ✅ Adds createdAt and updatedAt columns
  }
);
