import express from "express";

import {
  registerUser,
  loginUser,
  getCurrentUser,
  registerTherapist,
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

// PUBLIC ROUTES
router.post("/register", registerUser);
router.post("/register-therapist", registerTherapist);
router.post("/login", loginUser);

// AUTHENTICATED ROUTE
router.get("/me", authMiddleware, getCurrentUser);

// TEMPORARY ROLE TEST ROUTES
router.get(
  "/test/client",
  authMiddleware,
  authorizeRoles("client"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Client access granted",
    });
  }
);

router.get(
  "/test/therapist",
  authMiddleware,
  authorizeRoles("therapist"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Therapist access granted",
    });
  }
);

export default router;
