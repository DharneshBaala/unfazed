import express from "express";

import {
  setMyAvailability,
  getMyAvailability,
} from "../controllers/schedulingController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";


const router = express.Router();

// ==========================================
// THERAPIST AVAILABILITY ROUTES
// ==========================================

// Create or update therapist availability
router.put(
  "/me",
  authMiddleware,
  authorizeRoles("therapist"),
  setMyAvailability
);

 // Get logged-in therapist's availability
router.get(
  "/me",
  authMiddleware,
  authorizeRoles("therapist"),
  getMyAvailability
);



export default router;
