import { DataTypes } from "sequelize";
import { sequelize } from "../Config/connectDb.js";

export const State = sequelize.define("state", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
}, {
  tableName: "states",
  timestamps: false,
});
