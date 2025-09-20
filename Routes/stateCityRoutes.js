import express from "express";
import { getStates, getCitiesByState } from "../Controllers/stateCityController.js";

const router = express.Router();

router.get("/states", getStates);           // ✅ Get all states
router.get("/cities/:stateId", getCitiesByState);  // ✅ Get cities by state

export default router;
