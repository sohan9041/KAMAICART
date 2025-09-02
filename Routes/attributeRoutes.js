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
import { verifyUser,cookiesverifyUser } from "../Middleware/verifyAuthMiddleware.js";

const router = express.Router();

// ✅ Attribute Routes
router.post("/", cookiesverifyUser, addAttribute);          // Add Attribute
router.get("/", cookiesverifyUser, getAttributes);          // Get All Attributes
router.get("/:id", cookiesverifyUser, getAttribute);        // Get Attribute by ID
router.put("/:id", cookiesverifyUser, updateAttributeById); // Update Attribute by ID
router.delete("/:id", cookiesverifyUser, deleteAttributeById); // Soft Delete Attribute by ID

// ✅ Attribute Value Routes
router.post("/values", cookiesverifyUser, addAttributeValue);           // Add Attribute Value
//router.get("/:attribute_id/values", cookiesverifyUser, getAttributeValues);           // Get All Attribute Values
//router.put("/values/:id", cookiesverifyUser, updateAttributeValueById); // Update Attribute Value by ID
//router.delete("/values/:id", cookiesverifyUser, deleteAttributeValueById); // Soft Delete Attribute Value by ID 

export default router;
