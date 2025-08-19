import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// Create Sequelize instance
export const sequelize = new Sequelize(
  process.env.DATABASE,  // database name
  process.env.USER,      // username
  process.env.PASSWORD,  // password
  {
    host: process.env.HOST,
    port: process.env.DBPORT,
    dialect: "postgres",
    logging: false, // disable SQL logs in console
  }
);

// Test connection
export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ PostgreSQL connected via Sequelize!");
  } catch (err) {
    console.error("❌ Connection error:", err.message);
  }
};
