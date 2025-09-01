// Schema/Token.js
import { DataTypes } from "sequelize";
import {sequelize} from "../Config/connectDb.js"; // adjust path

const Token = sequelize.define(
  "Token",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    user_type: { type: DataTypes.STRING }, // e.g., 'customer' or role_id if you prefer
    token: { type: DataTypes.TEXT, allowNull: false },
    device: { type: DataTypes.STRING, allowNull: true },
    ip_address: { type: DataTypes.STRING, allowNull: true },
    expires_at: { type: DataTypes.DATE, allowNull: true },
    revoked: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    tableName: "tokens",
    timestamps: true,
    underscored: false,
  }
);

export default Token;
