import express from "express";

import {
  getMyTherapistProfile,
  updateMyTherapistProfile,
  getMyAvailability,
  updateMyAvailability,
} from "../controllers/therapistController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

// ==========================================
// THERAPIST PROFILE ROUTES
// ==========================================

// GET logged-in therapist's profile
router.get(
  "/me",
  authMiddleware,
  authorizeRoles("therapist"),
  getMyTherapistProfile
);

// PATCH logged-in therapist's profile
router.patch(
  "/me",
  authMiddleware,
  authorizeRoles("therapist"),
  updateMyTherapistProfile
);

// ==========================================
// THERAPIST AVAILABILITY ROUTES
// ==========================================

// GET logged-in therapist's weekly availability
router.get(
  "/availability",
  authMiddleware,
  authorizeRoles("therapist"),
  getMyAvailability
);

// PUT logged-in therapist's weekly availability
router.put(
  "/availability",
  authMiddleware,
  authorizeRoles("therapist"),
  updateMyAvailability
);

export default router;
