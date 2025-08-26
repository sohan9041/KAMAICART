import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../Helper/cloudinary.js";

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products", // Cloudinary folder name
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // ✅ 5 MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only .jpg, .jpeg, .png files are allowed"));
    }
  },
});


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Storage config
const storageSetting = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads/settings");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|ico/;
  const extname = allowed.test(path.extname(file.originalname).toLowerCase());
  if (extname) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed (jpg, png, gif, ico)"));
  }
};

const Icon = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads/icon");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// ✅ File filter (only allow images, for example)
const fileFilterForRole = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|svg/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed"), false);
  }
};

const Category = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads/category");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const profileImage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads/user");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// ✅ Final upload middleware
export const uploadProfileImage = multer({ storage: profileImage, fileFilterForRole });

export const uploadCategoryImage = multer({ storage: Category, fileFilterForRole });

export const uploadIcon = multer({ storage: Icon, fileFilterForRole });

export const uploadSettingsImage = multer({ storageSetting, fileFilter });
