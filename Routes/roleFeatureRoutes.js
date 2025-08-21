import express from "express";
import {
  createOrUpdateRoleFeature,
  getRoleFeatureById,
  getAllRoleFeatures,
  deleteRoleFeatureById,
} from "../Controllers/roleFeatureController.js";
import { verifyUser } from "../Middleware/verifyAuthMiddleware.js";

const router = express.Router();

router.post("/",verifyUser, createOrUpdateRoleFeature); // Add / Update
router.get("/",verifyUser, getAllRoleFeatures);         // Get all
router.get("/:id",verifyUser, getRoleFeatureById);      // Get by ID
router.delete("/:id",verifyUser, deleteRoleFeatureById);// Delete

export default router;
