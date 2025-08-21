// config/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});


async function testCloudinary() {
  try {
    // ✅ Upload a sample image (replace with any local image path)
    const result = await cloudinary.uploader.upload("https://res.cloudinary.com/demo/image/upload/sample.jpg", {
      folder: "test_uploads",
    });

    console.log("✅ Cloudinary working fine!");
    console.log("📷 Uploaded File URL:", result.secure_url);
  } catch (error) {
    console.error("❌ Cloudinary error:", error);
  }
}

// testCloudinary()

export default cloudinary;
