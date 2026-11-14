import mongoose from "mongoose";

const therapistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    specialization: {
      type: String,
      required: [true, "Specialization is required"],
      trim: true,
    },

    qualification: {
      type: String,
      required: [true, "Qualification is required"],
      trim: true,
    },

    experience: {
      type: Number,
      required: [true, "Experience is required"],
      min: 0,
    },

    // Appointment duration configured by therapist
    sessionDurationMinutes: {
      type: Number,
      enum: [30, 45, 60, 75, 90],
      default: 60,
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    profileImage: {
      type: String,
      default: "",
    },

    slug: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    isApproved: {
      type: Boolean,
      default: false,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const Therapist = mongoose.model("Therapist", therapistSchema);

export default Therapist;
