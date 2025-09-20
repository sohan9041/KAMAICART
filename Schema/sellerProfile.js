import { DataTypes } from "sequelize";
import { sequelize } from "../Config/connectDb.js";
import { User } from "./user.js"; // import User model

export const SellerProfile = sequelize.define(
  "seller_profile",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    // Foreign key to users table
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users", // table name
        key: "id",
      },
      onDelete: "CASCADE",
    },

    // Step 1: Personal Info
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    pincode: { type: DataTypes.STRING, allowNull: false },

    // Step 2: Shop Info
    shopName: { type: DataTypes.STRING, allowNull: false },
    shopAddress: { type: DataTypes.TEXT, allowNull: false },
    pickupAddress: { type: DataTypes.TEXT, allowNull: false },
    state: { type: DataTypes.STRING, allowNull: false },
    city: { type: DataTypes.STRING, allowNull: false },
    gstNumber: { type: DataTypes.STRING, allowNull: true },

    // Step 3: Documents (file paths)
    shopImage: {
      type: DataTypes.STRING,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue("shopImage"); // 👈 corrected field name
        if (!rawValue) return null;
        return `${process.env.BASE_URL}${rawValue}`;
      },
    },
    adharCard: {
      type: DataTypes.STRING,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue("adharCard");
        if (!rawValue) return null;
        return `${process.env.BASE_URL}${rawValue}`;
      },
    },
    panCard: {
      type: DataTypes.STRING,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue("panCard");
        if (!rawValue) return null;
        return `${process.env.BASE_URL}${rawValue}`;
      },
    },
    gstCertificate: {
      type: DataTypes.STRING,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue("gstCertificate");
        if (!rawValue) return null;
        return `${process.env.BASE_URL}${rawValue}`;
      },
    },
    cancelCheck: {
      type: DataTypes.STRING,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue("cancelCheck");
        if (!rawValue) return null;
        return `${process.env.BASE_URL}${rawValue}`;
      },
    },

    // Step 4: Bank Details
    bankName: { type: DataTypes.STRING, allowNull: false },
    ifsc: { type: DataTypes.STRING, allowNull: false },
    accountNumber: { type: DataTypes.STRING, allowNull: false },
  },
  {
    tableName: "seller_profiles",
    timestamps: true, // createdAt, updatedAt
  }
);

// ✅ Associations
SellerProfile.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasOne(SellerProfile, { foreignKey: "user_id", as: "sellerProfile" });
