import express from "express";

import {
  saveClientIntake,
  getClientIntake,
} from "../controllers/clientIntakeController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

// Client saves a draft or submits their intake
router.post(
  "/:therapistId",
  authMiddleware,
  authorizeRoles("client"),
  saveClientIntake
);

// Therapist views a submitted client intake
router.get(
  "/:clientId",
  authMiddleware,
  authorizeRoles("therapist"),
  getClientIntake
);

export default router;
