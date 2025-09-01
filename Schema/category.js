import { DataTypes } from "sequelize";
import { sequelize } from "../Config/connectDb.js";

const Category = sequelize.define(
  "Category",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
      get() {
      const rawValue = this.getDataValue("image");
      if (!rawValue) return null;
      return `${process.env.BASE_URL}${rawValue}`;
    },
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    priority:{
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    unique_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "categories",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    is_delete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "categories",
    timestamps: false, // set true if you have createdAt / updatedAt
  }
);

Category.hasMany(Category, { as: "children", foreignKey: "parent_id" });
Category.belongsTo(Category, { as: "parent", foreignKey: "parent_id" });

export default Category;
