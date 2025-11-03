import { DataTypes } from "sequelize";
import {sequelize} from "../Config/connectDb.js";
import Category from "./category.js";

const Attribute = sequelize.define("Attribute", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false, // e.g. "Size", "Color"
  },
  category_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  input_type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
   is_deleted: {
    type: DataTypes.BOOLEAN,
    allowNull: false, 
    defaultValue:false
  },
}, {
  tableName: "attributes",
  timestamps: true,
});

Attribute.belongsTo(Category, { foreignKey: "category_id", as: "category" });

export default Attribute;
