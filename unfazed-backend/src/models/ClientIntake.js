import mongoose from "mongoose";

const clientIntakeSchema = new mongoose.Schema(
  {
    // Which therapist's practice owns this intake?
    therapist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Therapist",
      required: true,
    },

    // Which client submitted the intake?
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },

    // Why is the client seeking therapy?
    reasonForSeeking: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    // What does the client hope to achieve?
    therapyGoals: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    // Has the client attended therapy before?
    previousTherapy: {
      type: String,
      enum: ["yes", "no", "prefer_not_to_say"],
      default: "prefer_not_to_say",
    },

    // Other relevant information voluntarily provided
    additionalInformation: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: "",
    },

    // Emergency contact information
    emergencyContact: {
      name: {
        type: String,
        trim: true,
        maxlength: 100,
        default: "",
      },
      relationship: {
        type: String,
        trim: true,
        maxlength: 50,
        default: "",
      },
      phone: {
        type: String,
        trim: true,
        maxlength: 20,
        default: "",
      },
    },

    // Client consent records
    consent: {
      therapy: {
        type: Boolean,
        default: false,
      },
      privacyPolicy: {
        type: Boolean,
        default: false,
      },
      recordedAt: {
        type: Date,
        default: null,
      },
      policyVersion: {
        type: String,
        default: "",
      },
    },

    status: {
      type: String,
      enum: ["draft", "submitted"],
      default: "draft",
    },

    submittedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// One intake per client for each therapist
clientIntakeSchema.index(
  { therapist: 1, client: 1 },
  { unique: true }
);

clientIntakeSchema.index({ therapist: 1, status: 1 });

const ClientIntake = mongoose.model(
  "ClientIntake",
  clientIntakeSchema
);

export default ClientIntake;
