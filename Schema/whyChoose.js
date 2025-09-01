import { DataTypes } from "sequelize";
import { sequelize } from "../Config/connectDb.js"; // adjust path to your db connection

export const WhyChoose = sequelize.define(
  "WhyChoose",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    icon: {
      type: DataTypes.STRING, // store file path or icon name
      allowNull: false,
      get() {
        const rawValue = this.getDataValue("icon");
        if (!rawValue) return null;
        return `${process.env.BASE_URL}${rawValue}`;
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    is_delete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "why_choose",
    timestamps: true, // createdAt & updatedAt
  }
);
