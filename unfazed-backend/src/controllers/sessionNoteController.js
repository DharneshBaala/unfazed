import mongoose from "mongoose";

import SessionNote from "../models/sessionnote.js";
import Therapist from "../models/Therapist.js";
import Client from "../models/Client.js";
import TherapistClient from "../models/TherapistClient.js";
import Session from "../models/Session.js";

// ==========================================
// GET THERAPIST NOTES
// ==========================================

export const getMySessionNotes = async (req, res) => {
  try {
    const therapist = await Therapist.findOne({
      user: req.user.userId,
    });

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: "Therapist profile not found",
      });
    }

    const notes = await SessionNote.find({
      therapist: therapist._id,
    })
      .populate({
        path: "client",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .populate("session")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: notes.length,
      notes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve notes",
      error: error.message,
    });
  }
};

// ==========================================
// CREATE SESSION NOTE
// ==========================================

export const createSessionNote = async (req, res) => {
  try {
    const { clientId, sessionId, title, content } = req.body;

    if (!clientId || !title?.trim() || !content?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Client, title and content are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid client ID",
      });
    }

    const therapist = await Therapist.findOne({
      user: req.user.userId,
    });

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: "Therapist profile not found",
      });
    }

    const client = await Client.findById(clientId);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    // Verify that this client belongs to this therapist.

    const relationship = await TherapistClient.findOne({
      therapist: therapist._id,
      client: clientId,
      status: "active",
    });

    if (!relationship) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to create notes for this client",
      });
    }

    // Validate optional session reference.

    let session = null;

    if (sessionId) {
      if (!mongoose.Types.ObjectId.isValid(sessionId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid session ID",
        });
      }

      session = await Session.findOne({
        _id: sessionId,
        therapist: therapist._id,
        client: clientId,
      });

      if (!session) {
        return res.status(403).json({
          success: false,
          message: "Session does not belong to this therapist and client",
        });
      }
    }

    const newNote = await SessionNote.create({
      therapist: therapist._id,
      client: clientId,
      session: session ? session._id : null,
      title: title.trim(),
      content: content.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Note created successfully",
      note: newNote,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create note",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE SESSION NOTE
// ==========================================

export const updateSessionNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { title, content } = req.body;

    // Validate note ID
    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid note ID",
      });
    }

    // Validate input fields
    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
      });
    }

    if (title.trim().length > 150 || content.trim().length > 10000) {
      return res.status(400).json({
        success: false,
        message: "Title or content exceeds the allowed length",
      });
    }

    // Find the logged-in therapist
    const therapist = await Therapist.findOne({
      user: req.user.userId,
    });

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: "Therapist profile not found",
      });
    }

    // Find and update only this therapist's note
    const note = await SessionNote.findOneAndUpdate(
      {
        _id: noteId,
        therapist: therapist._id,
      },
      {
        title: title.trim(),
        content: content.trim(),
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found or you are not authorized to update it",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Note updated successfully",
      note,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update note",
      error: error.message,
    });
  }
};

// ==========================================
// DELETE SESSION NOTE
// ==========================================

export const deleteSessionNote = async (req, res) => {
  try {
    const { noteId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid note ID",
      });
    }

    const therapist = await Therapist.findOne({
      user: req.user.userId,
    });

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: "Therapist profile not found",
      });
    }

    const note = await SessionNote.findOneAndDelete({
      _id: noteId,
      therapist: therapist._id,
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found or you are not authorized to delete it",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete note",
      error: error.message,
    });
  }
};
