// Schema/product.js
import { DataTypes } from "sequelize";
import { sequelize } from "../Config/connectDb.js";

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    shop_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    category_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    short_description: {
      type: DataTypes.TEXT,
    },
    description: {
      type: DataTypes.TEXT,
    },
    brand: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "active",
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "products",
    timestamps: true, // adds createdAt & updatedAt
  }
);

export default Product;
