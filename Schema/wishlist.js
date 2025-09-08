import { DataTypes } from "sequelize";
import { sequelize } from "../Config/connectDb.js";
import  Product from "./product.js";
import { User } from "./user.js";

const Wishlist = sequelize.define(
  "Wishlist",
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
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    added_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "wishlists",
    timestamps: false, // ✅ since you only have `added_at`
  }
);

// Associations
Wishlist.belongsTo(User, { foreignKey: "user_id", as: "user" });
Wishlist.belongsTo(Product, { foreignKey: "product_id", as: "product" });

export default Wishlist;
