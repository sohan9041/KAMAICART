import express from "express";
import {
  createOrUpdateRoleFeature,
  getRoleFeatureById,
  getAllRoleFeatures,
  deleteRoleFeatureById,
} from "../Controllers/roleFeatureController.js";
import { cookiesVerifyUser } from "../Middleware/verifyAuthMiddleware.js";

const router = express.Router();

router.post("/",cookiesVerifyUser, createOrUpdateRoleFeature); // Add / Update
router.get("/",cookiesVerifyUser, getAllRoleFeatures);         // Get all
router.get("/:id",cookiesVerifyUser, getRoleFeatureById);      // Get by ID
router.delete("/:id",cookiesVerifyUser, deleteRoleFeatureById);// Delete

export default router;
