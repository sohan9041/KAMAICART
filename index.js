import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import { connectDB } from "./Config/connectDb.js";
import { router } from "./Routes/auth_Routes.js";
import { Admin_router } from "./Routes/Category_Routes.js";
import { ProductRouter } from "./Routes/Product_Routes.js";
const app = express();
app.use(cookieParser());
dotenv.config();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.use("/product", ProductRouter);
app.use("/auth", router);
app.use("/admin", Admin_router);
app.use(morgan("dev"));
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(express.urlencoded({ extended: true }));

app.get("/sohan", (req, res) => {
  res.json({
    status: "success",
    message: "Welcome to the backend" + process.env.PORT,
  });
});

connectDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log("server is running ", process.env.PORT);
  });
});
