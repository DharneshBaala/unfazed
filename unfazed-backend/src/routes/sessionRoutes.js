import express from "express";

import {
  getAvailableSlots,
  bookSession,
  cancelSession,
  getMySessions,
  confirmSession,
  completeSession,
   markNoShow,
} from "../controllers/sessionController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

// PUBLIC: GET AVAILABLE APPOINTMENT SLOTS
router.get(
  "/:therapistId/available-slots",
  getAvailableSlots
);

// CLIENT: BOOK AN APPOINTMENT
router.post(
  "/book",
  authMiddleware,
  authorizeRoles("client"),
  bookSession
);

router.patch(
  "/:sessionId/cancel",
  authMiddleware,
  authorizeRoles("client", "therapist"),
  cancelSession
);

// THERAPIST: CONFIRM AN APPOINTMENT

router.patch(
  "/:sessionId/confirm",
  authMiddleware,
  authorizeRoles("therapist"),
  confirmSession
);

// THERAPIST: MARK AN APPOINTMENT AS COMPLETED

router.patch(
  "/:sessionId/complete",
  authMiddleware,
  authorizeRoles("therapist"),
  completeSession
);

// THERAPIST: MARK AN APPOINTMENT AS NO-SHOW

router.patch(
  "/:sessionId/no-show",
  authMiddleware,
  authorizeRoles("therapist"),
  markNoShow
);

router.get(
  "/my",
  authMiddleware,
  authorizeRoles("client", "therapist"),
  getMySessions
);

export default router;