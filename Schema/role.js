import { DataTypes } from "sequelize";
import { sequelize } from "../Config/connectDb.js";

export const Role = sequelize.define("role", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  icon: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  description: { 
    type: DataTypes.TEXT, 
    allowNull: true 
  },
  button_text: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  is_deleted: {
  type: DataTypes.BOOLEAN,
  defaultValue: false,
}
}, {
  tableName: "roles",
  timestamps: true, // createdAt & updatedAt
});
