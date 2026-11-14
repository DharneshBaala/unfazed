import express from "express";

import {
  createAppointment,
  getMyAppointments,
  updateAppointment,
  cancelAppointment,
} from "../controllers/appointmentController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

// All appointment routes require therapist authentication
router.use(authMiddleware, authorizeRoles("therapist"));

// Create appointment
router.post("/", createAppointment);

// Get therapist appointments
router.get("/", getMyAppointments);

// Update appointment
router.patch("/:appointmentId", updateAppointment);

// Cancel appointment
router.patch("/:appointmentId/cancel", cancelAppointment);

export default router;