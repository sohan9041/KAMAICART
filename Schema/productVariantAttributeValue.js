import { DataTypes } from "sequelize";
import {sequelize} from "../Config/connectDb.js";

import Attribute from "./attribute.js";
import AttributeValue from "./attributeValue.js";

const ProductVariantAttributeValue = sequelize.define("ProductVariantAttributeValue", {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  product_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  variant_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  attribute_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  attribute_value_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
}, {
  tableName: "product_variant_attribute_values",
  timestamps: true,
});

ProductVariantAttributeValue.belongsTo(Attribute, { foreignKey: "attribute_id", as: "attribute" });
ProductVariantAttributeValue.belongsTo(AttributeValue, { foreignKey: "attribute_value_id", as: "attribute_value" });
AttributeValue.hasMany(ProductVariantAttributeValue, { foreignKey: "attribute_value_id",as: "product_variant_values"});

export default ProductVariantAttributeValue;
