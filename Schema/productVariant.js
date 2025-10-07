import { DataTypes } from "sequelize";
import {sequelize} from "../Config/connectDb.js"; // your sequelize instance
import ProductVariantAttributeValue from "./productVariantAttributeValue.js";
import ProductImage from "./productImage.js";

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
  shipping_cost: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false,
  },
  selling_price: {
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

ProductVariant.hasMany(ProductVariantAttributeValue, { foreignKey: "variant_id", as: "attributes" });
ProductVariantAttributeValue.belongsTo(ProductVariant, { foreignKey: "variant_id", as: "variant" });


ProductVariant.hasMany(ProductImage, {
  foreignKey: "variant_id",
  as: "variant_images",
});


export default ProductVariant;
