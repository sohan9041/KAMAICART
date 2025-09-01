import { DataTypes } from "sequelize";
import { sequelize } from "../Config/connectDb.js";
import { Role } from "./role.js";  // import Role model

export const User = sequelize.define("user", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  email: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    unique: true 
  },
  phoneno: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    unique: true 
  },
   profileImage: { 
    type: DataTypes.STRING, 
    allowNull: true, 
  },
  otp: { 
    type: DataTypes.STRING, 
    allowNull: true, 
  },
  otp_expiry: { 
    type: DataTypes.DATE, 
    allowNull: true, 
  },
  password: { 
    type: DataTypes.STRING, 
    allowNull: false 
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
  status: {
    type: DataTypes.ENUM("active", "inactive"),
    allowNull: false,
    defaultValue: "active",
  },
}, {
  tableName: "users",
  timestamps: false,
});

// ✅ Associations
User.belongsTo(Role, { foreignKey: "role_id", as: "role" });
Role.hasMany(User, { foreignKey: "role_id", as: "users" });
