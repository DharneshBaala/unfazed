import Availability from "../models/Availability.js";
import Therapist from "../models/Therapist.js";

// ==========================================
// TIMEZONE VALIDATOR
// ==========================================

const isValidTimezone = (timezone) => {
  try {
    Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
    });

    return true;
  } catch (error) {
    return false;
  }
};

// ==========================================
// SET MY AVAILABILITY
// ==========================================

export const setMyAvailability = async (req, res, next) => {
  try {
    // 1. Validate request body
    if (
      !req.body ||
      typeof req.body !== "object" ||
      Array.isArray(req.body)
    ) {
      return res.status(400).json({
        success: false,
        message: "Request body must be a JSON object",
      });
    }

    // 2. Get schedule details
    const { weeklySchedule, timezone } = req.body;

    // Reject unexpected request fields
    const allowedFields = ["weeklySchedule", "timezone"];

    const unexpectedFields = Object.keys(req.body).filter(
      (field) => !allowedFields.includes(field)
    );

    if (unexpectedFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Unexpected fields are not allowed",
        fields: unexpectedFields,
      });
    }

    // 3. Validate weekly schedule
    if (
      !Array.isArray(weeklySchedule) ||
      weeklySchedule.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid weekly schedule",
      });
    }

    // 4. Validate timezone
    if (
      timezone !== undefined &&
      (typeof timezone !== "string" || !isValidTimezone(timezone))
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid timezone",
      });
    }

    // 5. Validate each day's schedule structure
    const validDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    for (const daySchedule of weeklySchedule) {
      if (
        !daySchedule ||
        typeof daySchedule !== "object" ||
        Array.isArray(daySchedule) ||
        !validDays.includes(daySchedule.day) ||
        !Array.isArray(daySchedule.slots)
      ) {
        return res.status(400).json({
          success: false,
          message: "Each day must have a valid day name and slots array",
        });
      }

      // Reject unexpected fields inside a day
      const allowedDayFields = ["day", "slots"];

      const unexpectedDayFields = Object.keys(daySchedule).filter(
        (field) => !allowedDayFields.includes(field)
      );

      if (unexpectedDayFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Unexpected fields are not allowed in day schedule",
          fields: unexpectedDayFields,
        });
      }
    }

    // 6. Prevent duplicate weekdays
    const submittedDays = weeklySchedule.map(
      (daySchedule) => daySchedule.day
    );

    if (new Set(submittedDays).size !== submittedDays.length) {
      return res.status(400).json({
        success: false,
        message: "Each weekday can only appear once",
      });
    }

    // 7. Validate individual time slots
    const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

    for (const daySchedule of weeklySchedule) {
      for (const slot of daySchedule.slots) {
        if (
          !slot ||
          typeof slot !== "object" ||
          Array.isArray(slot) ||
          typeof slot.startTime !== "string" ||
          typeof slot.endTime !== "string" ||
          !timeRegex.test(slot.startTime) ||
          !timeRegex.test(slot.endTime)
        ) {
          return res.status(400).json({
            success: false,
            message: "Each time slot must have valid startTime and endTime",
          });
        }

        // Reject unexpected fields inside a time slot
        const allowedSlotFields = ["startTime", "endTime"];

        const unexpectedSlotFields = Object.keys(slot).filter(
          (field) => !allowedSlotFields.includes(field)
        );

        if (unexpectedSlotFields.length > 0) {
          return res.status(400).json({
            success: false,
            message: "Unexpected fields are not allowed in time slots",
            fields: unexpectedSlotFields,
          });
        }

        const [startHour, startMinute] = slot.startTime
          .split(":")
          .map(Number);

        const [endHour, endMinute] = slot.endTime
          .split(":")
          .map(Number);

        const start = startHour * 60 + startMinute;
        const end = endHour * 60 + endMinute;

        if (end <= start) {
          return res.status(400).json({
            success: false,
            message: "End time must be later than start time",
          });
        }
      }
    }

    // 8. Check for overlapping time slots
    for (const daySchedule of weeklySchedule) {
      const slots = daySchedule.slots;

      const convertedSlots = slots.map((slot) => {
        const [startHour, startMinute] = slot.startTime
          .split(":")
          .map(Number);

        const [endHour, endMinute] = slot.endTime
          .split(":")
          .map(Number);

        return {
          start: startHour * 60 + startMinute,
          end: endHour * 60 + endMinute,
        };
      });

      convertedSlots.sort((a, b) => a.start - b.start);

      for (let i = 0; i < convertedSlots.length - 1; i++) {
        if (convertedSlots[i].end > convertedSlots[i + 1].start) {
          return res.status(400).json({
            success: false,
            message: "Time slots cannot overlap",
          });
        }
      }
    }

    // 9. Find logged-in therapist
    const therapist = await Therapist.findOne({
      user: req.user.userId,
    });

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: "Therapist profile not found",
      });
    }

    // 10. Find existing availability
    let availability = await Availability.findOne({
      therapist: therapist._id,
    });

    // 11. Create or update availability
    if (!availability) {
      availability = new Availability({
        therapist: therapist._id,
        weeklySchedule,
        timezone: timezone || "Asia/Kolkata",
      });
    } else {
      availability.weeklySchedule = weeklySchedule;

      if (timezone !== undefined) {
        availability.timezone = timezone;
      }
    }

    // 12. Save availability
    await availability.save();

    // 13. Send response
    return res.status(200).json({
      success: true,
      message: "Availability saved successfully",
      availability,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// GET MY AVAILABILITY
// ==========================================

export const getMyAvailability = async (req, res, next) => {
  try {
    // 1. Find logged-in therapist
    const therapist = await Therapist.findOne({
      user: req.user.userId,
    });

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: "Therapist profile not found",
      });
    }

    // 2. Find therapist availability
    const availability = await Availability.findOne({
      therapist: therapist._id,
    });

    // 3. Check whether availability exists
    if (!availability) {
      return res.status(404).json({
        success: false,
        message: "Availability not found. Please set your availability first.",
      });
    }

    // 4. Return availability
    return res.status(200).json({
      success: true,
      availability,
    });
  } catch (error) {
    next(error);
  }
};
