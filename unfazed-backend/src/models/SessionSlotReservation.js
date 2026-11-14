import mongoose from "mongoose";

const sessionSlotReservationSchema = new mongoose.Schema(
  {
    therapist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Therapist",
      required: true,
    },

    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },

    slotStartAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Each therapist can have only one reservation
// for a particular 15-minute time block.
sessionSlotReservationSchema.index(
  {
    therapist: 1,
    slotStartAt: 1,
  },
  {
    unique: true,
  }
);

// Quickly find all reserved blocks belonging to a session.
sessionSlotReservationSchema.index({
  session: 1,
});

const SessionSlotReservation = mongoose.model(
  "SessionSlotReservation",
  sessionSlotReservationSchema
);

export default SessionSlotReservation;
