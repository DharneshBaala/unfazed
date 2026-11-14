import mongoose from "mongoose";

const sessionNoteSchema = new mongoose.Schema(
  {
    therapist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Therapist",
      required: true,
    },

    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },

    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      default: null,
    },

    title: {
      type: String,
      required: [true, "Note title is required"],
      trim: true,
      maxlength: 150,
    },

    content: {
      type: String,
      required: [true, "Note content is required"],
      trim: true,
      maxlength: 10000,
    },
  },
  {
    timestamps: true,
  }
);

// Retrieve a therapist's notes for a particular client.
sessionNoteSchema.index({
  therapist: 1,
  client: 1,
  createdAt: -1,
});

const SessionNote = mongoose.model(
  "SessionNote",
  sessionNoteSchema
);

export default SessionNote;
