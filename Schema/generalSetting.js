import { DataTypes } from "sequelize";
import { sequelize } from "../Config/connectDb.js"; // your sequelize instance

export const GeneralSetting = sequelize.define("general_settings", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  site_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  logo: {
    type: DataTypes.STRING,
    allowNull: true,
    get() {
        const rawValue = this.getDataValue("logo");
        if (!rawValue) return null;
        return `${process.env.BASE_URL}${rawValue}`;
    }, 
  },
  favicon: {
    type: DataTypes.STRING,
    allowNull: true,
    get() {
        const rawValue = this.getDataValue("favicon");
        if (!rawValue) return null;
        return `${process.env.BASE_URL}${rawValue}`;
    }, 
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  timezone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});
