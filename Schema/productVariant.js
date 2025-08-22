import { DataTypes } from "sequelize";
import {sequelize} from "../Config/connectDb.js"; // your sequelize instance

const ProductVariant = sequelize.define("ProductVariant", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  sku: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false,
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  is_deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true, // adds createdAt and updatedAt
  tableName: "product_variants",
});

export default ProductVariant;
