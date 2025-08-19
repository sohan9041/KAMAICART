import { DataTypes } from "sequelize";
import { sequelize } from "../Config/connectDb.js";

export const AdminData = sequelize.define("admindata", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  phoneno: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, allowNull: false },
}, {
  tableName: "admindata",
  timestamps: false, // disable createdAt, updatedAt
});
