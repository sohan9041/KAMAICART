// models/ProductImage.js
import { DataTypes } from "sequelize";
import {sequelize} from "../Config/connectDb.js"; // your sequelize instance

const ProductImage = sequelize.define(
  "ProductImage",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "products", // matches Product table
        key: "id",
      },
      onDelete: "CASCADE",
    },

    variant_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "product_variants", // matches ProductVariant table
        key: "id",
      },
      onDelete: "CASCADE",
    },

    image_url: {
      type: DataTypes.STRING,
      allowNull: false,

       get() {
        const rawValue = this.getDataValue("image_url");
        if (!rawValue) return null;
        return `${process.env.BASE_URL}${rawValue}`;
      }, 
    },

    is_primary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false, // mark one as primary if needed
    },

    is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "product_images",
    timestamps: true, // createdAt & updatedAt
  }
);

export default ProductImage;
