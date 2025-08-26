import { DataTypes } from "sequelize";
import {sequelize} from "../Config/connectDb.js";

export const Banner = sequelize.define("Banner", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
  type: DataTypes.ENUM("web", "app"),
  allowNull: false,
},
  is_delete: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: "banners",
  timestamps: true,
});
