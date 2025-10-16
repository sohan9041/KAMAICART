import { DataTypes } from "sequelize";
import { sequelize } from "../Config/connectDb.js";

export const CancelReason = sequelize.define(
  "CancelReason",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    is_delete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "cancel_reasons",
    timestamps: true,
  }
);
