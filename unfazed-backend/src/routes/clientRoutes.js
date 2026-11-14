import express from "express";

import { 
  getMyClients,
  getClientById,
  updateClient,
  updateClientRelationshipStatus,
  inviteClient,
  getMyInvitations,
  respondToInvitation,
 } from "../controllers/clientController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

// Invite a registered client
router.post(
  "/invite",
  authMiddleware,
  authorizeRoles("therapist"),
  inviteClient
);

// Get all clients belonging to the logged-in therapist.
router.get(
  "/",
  authMiddleware,
  authorizeRoles("therapist"),
  getMyClients
);

// Get invitations received by the logged-in client
router.get(
  "/my-invitations",
  authMiddleware,
  authorizeRoles("client"),
  getMyInvitations
);

// Accept or reject a therapist invitation
router.patch(
  "/invitations/:invitationId/respond",
  authMiddleware,
  authorizeRoles("client"),
  respondToInvitation
);

router.get(
  "/:clientId",
  authMiddleware,
  authorizeRoles("therapist"),
  getClientById
);

router.patch(
  "/:clientId",
  authMiddleware,
  authorizeRoles("therapist"),
  updateClient
);

router.patch(
  "/:clientId/relationship-status",
  authMiddleware,
  authorizeRoles("therapist"),
  updateClientRelationshipStatus
);

export default router;
