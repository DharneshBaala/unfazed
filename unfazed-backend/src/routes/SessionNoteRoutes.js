import express from "express";

import {
  getMySessionNotes,
  createSessionNote,
  updateSessionNote,
  deleteSessionNote,
} from "../controllers/sessionNoteController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

// All routes require therapist authentication.
router.use(authMiddleware);
router.use(authorizeRoles("therapist"));

// GET all notes belonging to the logged-in therapist.
router.get("/", getMySessionNotes);

// CREATE a new note.
router.post("/", createSessionNote);

// UPDATE an existing note.
router.patch("/:noteId", updateSessionNote);

// DELETE a note.
router.delete("/:noteId", deleteSessionNote);

export default router;
