import mongoose from "mongoose";

// Individual time slot
const timeSlotSchema = new mongoose.Schema(
  {
    startTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):[0-5]\d$/,
    },

    endTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):[0-5]\d$/,
    },
  },
  {
    _id: false,
  },
);

// Availability for one day
const dayScheduleSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      required: true,
    },

    slots: {
      type: [timeSlotSchema],
      default: [],
    },
  },
  {
    _id: false,
  },
);

// Main availability model
const availabilitySchema = new mongoose.Schema(
  {
    therapist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Therapist",
      required: true,
      unique: true,
    },

    weeklySchedule: {
      type: [dayScheduleSchema],
      default: [],

      validate: {
        validator: function (schedule) {
          // Prevent duplicate days
          const days = schedule.map((item) => item.day);

          if (new Set(days).size !== days.length) {
            return false;
          }
          
          // Validate time slots for each day
          for (const daySchedule of schedule) {
            const slots = daySchedule.slots;

            // Convert times into minutes
            const convertedSlots = slots.map((slot) => {
              const [startHour, startMinute] = slot.startTime
                .split(":")
                .map(Number);

              const [endHour, endMinute] = slot.endTime.split(":").map(Number);

              return {
                start: startHour * 60 + startMinute,
                end: endHour * 60 + endMinute,
              };
            });

            // Check invalid or overlapping slots
            convertedSlots.sort((a, b) => a.start - b.start);

            for (let i = 0; i < convertedSlots.length; i++) {
              const current = convertedSlots[i];

              // End must be after start
              if (current.end <= current.start) {
                return false;
              }

              // Check overlap with next slot
              if (
                i < convertedSlots.length - 1 &&
                current.end > convertedSlots[i + 1].start
              ) {
                return false;
              }
            }
          }

          return true;
        },

        message:
          "Schedule contains duplicate days, invalid time ranges, or overlapping slots",
      },
    },

    timezone: {
      type: String,
      default: "Asia/Kolkata",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const Availability = mongoose.model("Availability", availabilitySchema);

export default Availability;
