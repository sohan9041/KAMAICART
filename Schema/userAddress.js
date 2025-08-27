import { DataTypes } from "sequelize";
import { sequelize } from "../Config/connectDb.js";

export const UserAddress = sequelize.define("UserAddress", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    area: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    flat: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    postal_code: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    address1: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    address2: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    address_tag: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    default_address: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
}, {
        tableName: "user_address",
        timestamps: true, // adds createdAt & updatedAt
    }
);

export default UserAddress;