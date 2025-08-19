import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

export const client = new Pool({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.DBPORT,
});

export const connectDB = async () => {
  try {
    await client.connect();
    console.log("✅ PostgreSQL connected!");
  } catch (err) {
    console.error("❌ Connection error:", err.stack);
  }
};
