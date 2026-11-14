import mongoose from "mongoose";

// ==========================================
// SESSION / APPOINTMENT MODEL
// ==========================================

const sessionSchema = new mongoose.Schema(
  {
    // Therapist conducting the appointment
    therapist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Therapist",
      required: true,
    },

    // Client attending the appointment
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },

    // Appointment start date and time (stored in UTC)
    startAt: {
      type: Date,
      required: true,
    },

    // Appointment end date and time (stored in UTC)
    endAt: {
      type: Date,
      required: true,
    },

    // Timezone used when the appointment was booked
    timezone: {
      type: String,
      required: true,
      default: "Asia/Kolkata",
    },

    // Appointment type
    sessionType: {
      type: String,
      enum: ["online", "in_person"],
      required: true,
    },

    // Appointment status
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "cancelled",
        "completed",
        "no_show",
      ],
      default: "pending",
    },

    // Whether this appointment currently reserves its slot
    isSlotReserved: {
      type: Boolean,
      default: true,
    },

    // Optional meeting link for online appointments
    meetingLink: {
      type: String,
      default: null,
    },

    // Optional message from the client
    clientMessage: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    // Cancellation information
    cancellationReason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    // User who cancelled the appointment
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ==========================================
// VALIDATE APPOINTMENT TIME
// ==========================================

sessionSchema.pre("validate", function () {
  if (
    this.startAt &&
    this.endAt &&
    this.endAt <= this.startAt
  ) {
    this.invalidate(
      "endAt",
      "Appointment end time must be later than start time"
    );
  }
});

// ==========================================
// DATABASE INDEXES
// ==========================================

// Find therapist appointments efficiently
sessionSchema.index({
  therapist: 1,
  startAt: 1,
  status: 1,
});

// Find client appointments efficiently
sessionSchema.index({
  client: 1,
  startAt: 1,
  status: 1,
});

// Prevent duplicate reservations at the exact same start time
sessionSchema.index(
  {
    therapist: 1,
    startAt: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      isSlotReserved: true,
    },
  }
);

// ==========================================
// CREATE MODEL
// ==========================================

const Session = mongoose.model("Session", sessionSchema);

export default Session;
