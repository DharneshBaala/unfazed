import Availability from "../models/Availability.js";
import Therapist from "../models/Therapist.js";


export const setMyAvailability = async (req, res, next) => {
  try {
    // 1. Get schedule details from request body
    const { weeklySchedule, timezone } = req.body;

    // 2. Validate weekly schedule
    if (
      !Array.isArray(weeklySchedule) ||
      weeklySchedule.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid weekly schedule",
      });
    }

    // 3. Find logged-in therapist
    const therapist = await Therapist.findOne({
      user: req.user.userId,
    });

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: "Therapist profile not found",
      });
    }

    // 4. Find existing availability
    let availability = await Availability.findOne({
      therapist: therapist._id,
    });

    // 5. Create availability if it doesn't exist
    if (!availability) {
      availability = new Availability({
        therapist: therapist._id,
        weeklySchedule,
        timezone: timezone || "Asia/Kolkata",
      });
    } else {
      // 6. Update existing availability
      availability.weeklySchedule = weeklySchedule;

      if (timezone !== undefined) {
        availability.timezone = timezone;
      }
    }

    // 7. Save availability
    await availability.save();

    // 8. Send response
    return res.status(200).json({
      success: true,
      message: "Availability saved successfully",
      availability,
    });

  } catch (error) {
    next(error);
  }
};


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
