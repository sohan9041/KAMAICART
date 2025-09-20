import { DataTypes } from "sequelize";
import { sequelize } from "../Config/connectDb.js";
import { State } from "./state.js";

export const City = sequelize.define("city", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  state_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "states", key: "id" },
    onDelete: "CASCADE",
  },
}, {
  tableName: "cities",
  timestamps: false,
});

// Associations
City.belongsTo(State, { foreignKey: "state_id", as: "state" });
State.hasMany(City, { foreignKey: "state_id", as: "cities" });
