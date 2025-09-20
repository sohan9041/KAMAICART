import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import { connectDB } from "./Config/connectDb.js";
import { router } from "./Routes/authRoutes.js";

import apiRoutes from "./Routes/apiRoutes.js";
import userAddressRoutes from "./Routes/userAddressRoutes.js";
import productRoutes from "./Routes/productRoutes.js";
import generalSettingRoute from "./Routes/generalSettingRoute.js";
import roleRoutes from "./Routes/roleRoutes.js";
import roleFeatureRoutes from "./Routes/roleFeatureRoutes.js";
import whyChooseRoute from "./Routes/whyChooseRoute.js";
import categoryRoutes from "./Routes/categoryRoutes.js";
import attributeRoutes from "./Routes/attributeRoutes.js";
import productVariantRoutes from "./Routes/productVariantRoutes.js";
import bannerRoutes from "./Routes/bannerRoutes.js";
import brandRoutes from "./Routes/brandRoutes.js";
import sellerRoutes from "./Routes/sellerRoutes.js";
import stateCityRoutes from "./Routes/stateCityRoutes.js";


const app = express();
app.use(cookieParser());
dotenv.config();
// app.use(cors());

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",    // local frontend
  "http://localhost:3000",   // if you also use React dev server
  "https://www.kamaikart.in" // production frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true, // ✅ allow cookies/authorization headers
  })
);

app.use(express.json());

app.use("/", stateCityRoutes);
app.use("/product", productRoutes);
app.use("/user", apiRoutes);
app.use("/user", userAddressRoutes);
app.use("/seller", sellerRoutes);
app.use("/auth", router);
app.use("/categories", categoryRoutes);
app.use("/generalSetting", generalSettingRoute);
app.use("/roles", roleRoutes);
app.use("/roleFeature", roleFeatureRoutes);
app.use("/whyChoose", whyChooseRoute);
app.use("/attribute", attributeRoutes);
app.use("/productVariant", productVariantRoutes);
app.use("/banner", bannerRoutes);
app.use("/brand", brandRoutes);


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

// app.use(cors({ origin: "http://localhost:5173", credentials: true }));
// const corsOptions = {
//   origin: '*',
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   credentials: true,
// };

// app.use(cors(corsOptions));

connectDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log("server is running ", process.env.PORT);
  });
});
