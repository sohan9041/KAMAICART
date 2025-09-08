// Schema/product.js
import { DataTypes } from "sequelize";
import { sequelize } from "../Config/connectDb.js";
import ProductVariant from "./productVariant.js";
import ProductImage from "./productImage.js";
import Category from "./category.js";

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
    maincategory_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    subcategory_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    category_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
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
    product_type: {
      type: DataTypes.TEXT,
      allowNull: true,
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


Product.belongsTo(Category, { foreignKey: "category_id", as: "category" });
Category.hasMany(Product, { foreignKey: "category_id", as: "products" });


export default Product;
