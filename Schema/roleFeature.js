import { DataTypes } from "sequelize";
import { sequelize } from "../Config/connectDb.js";
import { Role } from "./role.js";

export const RoleFeature = sequelize.define("role_feature", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  feature: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role_id: { 
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "roles",  // table name
      key: "id",
    },
    onDelete: "CASCADE",
  },
   createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: "role_features",
  timestamps: true,
});

// Associations
Role.hasMany(RoleFeature, { foreignKey: "role_id", as: "features" });
RoleFeature.belongsTo(Role, { foreignKey: "role_id", as: "role" });
