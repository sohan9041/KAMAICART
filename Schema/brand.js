import { DataTypes } from "sequelize";
import {sequelize} from "../Config/connectDb.js";

export const Brand = sequelize.define("Brand", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  is_delete: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: "brands",
  timestamps: true,
});
