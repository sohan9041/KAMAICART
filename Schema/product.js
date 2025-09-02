// Schema/product.js
import { DataTypes } from "sequelize";
import { sequelize } from "../Config/connectDb.js";
import ProductVariant from "./productVariant.js";
import ProductImage from "./productImage.js";

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    shop_id: {
      type: DataTypes.INTEGER,
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
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
       allowNull: true,
    },
    brand: {
      type: DataTypes.STRING,
       allowNull: true,
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

Product.hasMany(ProductVariant, { foreignKey: "product_id", as: "variants" });
Product.hasMany(ProductImage, { foreignKey: "product_id", as: "images" });

ProductVariant.belongsTo(Product, { foreignKey: "product_id", as: "product" });


export default Product;
