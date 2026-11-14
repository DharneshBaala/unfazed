import mongoose from "mongoose";

const therapistClientSchema = new mongoose.Schema(
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

    status: {
      type: String,
      enum: ["pending", "active", "inactive", "rejected"],
      default: "pending",
    },

  },
  {
    timestamps: true,
  },
);

// Prevent duplicate relationships between the same client and therapist.
therapistClientSchema.index({ therapist: 1, client: 1 }, { unique: true });

// Help retrieve a therapist's active clients efficiently.
therapistClientSchema.index({ therapist: 1, status: 1 });

const TherapistClient = mongoose.model(
  "TherapistClient",
  therapistClientSchema,
);

export default TherapistClient;
