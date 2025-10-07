import { DataTypes } from "sequelize";
import { sequelize } from "../Config/connectDb.js";

export const Offer = sequelize.define("Offer", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false,
    get() {
      const rawValue = this.getDataValue("image");
      if (!rawValue) return null;
      return `${process.env.BASE_URL}${rawValue}`;
    },
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  link: {
    type: DataTypes.STRING,
    allowNull: true, // ✅ optional
  },
  is_delete: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: "offers",
  timestamps: true,
});
