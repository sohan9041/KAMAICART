import express from "express";
import {
  addAttribute,
  getAttributes,
  getAttribute,
  updateAttributeById,
  deleteAttributeById,
  addAttributeValue,
  getAttributeValues,
  updateAttributeValueById,
  deleteAttributeValueById,
} from "../Controllers/attributeController.js";
import { verifyUser } from "../Middleware/verifyAuthMiddleware.js";

const router = express.Router();

// ✅ Attribute Routes
router.post("/", verifyUser, addAttribute);          // Add Attribute
router.get("/", verifyUser, getAttributes);          // Get All Attributes
router.get("/:id", verifyUser, getAttribute);        // Get Attribute by ID
router.put("/:id", verifyUser, updateAttributeById); // Update Attribute by ID
router.delete("/:id", verifyUser, deleteAttributeById); // Soft Delete Attribute by ID

// ✅ Attribute Value Routes
router.post("/values", verifyUser, addAttributeValue);           // Add Attribute Value
router.get("/values", verifyUser, getAttributeValues);           // Get All Attribute Values
router.put("/values/:id", verifyUser, updateAttributeValueById); // Update Attribute Value by ID
router.delete("/values/:id", verifyUser, deleteAttributeValueById); // Soft Delete Attribute Value by ID

export default router;
