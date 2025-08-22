import { DataTypes } from "sequelize";
import {sequelize} from "../Config/connectDb.js";
import Attribute from "./attribute.js";

const AttributeValue = sequelize.define("AttributeValue", {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  attribute_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  value: {
    type: DataTypes.STRING,
    allowNull: false, // e.g. "Red", "L", "128 GB"
  },
   is_deleted: {
    type: DataTypes.BOOLEAN,
    allowNull: false, 
    defaultValue:false
  },
}, {
  tableName: "attribute_values",
  timestamps: true,
});

AttributeValue.belongsTo(Attribute, { foreignKey: "attribute_id", as: "attribute" });
Attribute.hasMany(AttributeValue, { foreignKey: "attribute_id", as: "values" });

export default AttributeValue;
