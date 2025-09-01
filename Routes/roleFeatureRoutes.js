import express from "express";
import {
  createOrUpdateRoleFeature,
  getRoleFeatureById,
  getAllRoleFeatures,
  deleteRoleFeatureById,
} from "../Controllers/roleFeatureController.js";
import { verifyUser,cookiesverifyUser } from "../Middleware/verifyAuthMiddleware.js";

const router = express.Router();

router.post("/",cookiesverifyUser, createOrUpdateRoleFeature); // Add / Update
router.get("/",cookiesverifyUser, getAllRoleFeatures);         // Get all
router.get("/:id",cookiesverifyUser, getRoleFeatureById);      // Get by ID
router.delete("/:id",cookiesverifyUser, deleteRoleFeatureById);// Delete

export default router;
