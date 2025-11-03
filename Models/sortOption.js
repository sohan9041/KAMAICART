import { DataTypes } from "sequelize";
import { sequelize } from "../Config/connectDb.js";

export const SortOption = sequelize.define(
  "sort_options",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // unique identifier (e.g., price_asc)
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false, // label to display
    },

    sort_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0, // sort listing in your UI
    },

    status: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 1, // 1 = active, 0 = inactive
    },
  },
  {
    tableName: "sort_options",
    timestamps: true, // createdAt, updatedAt
  }
);
