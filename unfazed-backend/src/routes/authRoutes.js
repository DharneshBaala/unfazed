import express from "express";

import {
  registerUser,
  loginUser,
  getCurrentUser,
  registerTherapist,
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// PUBLIC ROUTES
router.post("/register", registerUser);
router.post("/register-therapist", registerTherapist);
router.post("/login", loginUser);

// AUTHENTICATED ROUTE
router.get("/me", authMiddleware, getCurrentUser);

export default router;