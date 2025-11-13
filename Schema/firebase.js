// models/Firebase.js
import { DataTypes } from "sequelize";
import { sequelize } from "../Config/connectDb.js";

const Firebase = sequelize.define(
  "Firebase",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    device_id: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  },
  {
    tableName: "firebase_tokens",
    timestamps: true,
  }
);

export default Firebase;