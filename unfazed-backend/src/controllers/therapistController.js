import Availability from "../models/Availability.js";
import Therapist from "../models/Therapist.js";

// ==========================================
// GET MY THERAPIST PROFILE
// ==========================================

export const getMyTherapistProfile = async (req, res, next) => {
  try {
    // 1. Find therapist profile using logged-in user ID
    const therapist = await Therapist.findOne({
      user: req.user.userId,
    }).populate("user", "name email");

    // 2. Check whether therapist profile exists
    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: "Therapist profile not found",
      });
    }

    // 3. Return therapist profile
    return res.status(200).json({
      success: true,
      therapist,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// UPDATE MY THERAPIST PROFILE
// ==========================================

export const updateMyTherapistProfile = async (req, res, next) => {
  try {
    // 1. Get updated profile details
    const {
      specialization,
      qualification,
      experience,
      bio,
      sessionDurationMinutes,
      isAvailable,
    } = req.body;

    // 2. Define allowed fields
    const allowedFields = [
      "specialization",
      "qualification",
      "experience",
      "bio",
      "sessionDurationMinutes",
      "isAvailable",
    ];

    const providedFields = Object.keys(req.body);

    // 3. Check whether at least one field was provided
    if (providedFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one field to update",
      });
    }

    // 4. Reject fields that are not allowed
    const invalidFields = providedFields.filter(
      (field) => !allowedFields.includes(field),
    );

    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `You cannot update these fields: ${invalidFields.join(", ")}`,
      });
    }

    // 5. Validate specialization
    if (specialization !== undefined) {
      if (typeof specialization !== "string" || !specialization.trim()) {
        return res.status(400).json({
          success: false,
          message: "Specialization cannot be empty",
        });
      }
    }

    // 6. Validate qualification
    if (qualification !== undefined) {
      if (typeof qualification !== "string" || !qualification.trim()) {
        return res.status(400).json({
          success: false,
          message: "Qualification cannot be empty",
        });
      }
    }

    // 7. Validate experience
    if (experience !== undefined) {
      const experienceNumber = Number(experience);

      if (!Number.isFinite(experienceNumber) || experienceNumber < 0) {
        return res.status(400).json({
          success: false,
          message: "Experience must be a valid non-negative number",
        });
      }
    }

    // 8. Validate bio
    if (bio !== undefined) {
      if (typeof bio !== "string" || bio.length > 1000) {
        return res.status(400).json({
          success: false,
          message: "Bio must be text and cannot exceed 1000 characters",
        });
      }
    }

    // 9. Validate session duration
    if (
      sessionDurationMinutes !== undefined &&
      ![30, 45, 60, 75, 90].includes(sessionDurationMinutes)
    ) {
      return res.status(400).json({
        success: false,
        message: "Session duration must be 30, 45, 60, 75, or 90 minutes",
      });
    }

    // Validate therapist availability
    if (isAvailable !== undefined && typeof isAvailable !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Availability must be true or false",
      });
    }

    // 10. Find logged-in therapist profile
    const therapist = await Therapist.findOne({
      user: req.user.userId,
    });

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: "Therapist profile not found",
      });
    }

    // 11. Update only the provided fields
    if (specialization !== undefined) {
      therapist.specialization = specialization.trim();
    }

    if (qualification !== undefined) {
      therapist.qualification = qualification.trim();
    }

    if (experience !== undefined) {
      therapist.experience = Number(experience);
    }

    if (bio !== undefined) {
      therapist.bio = bio.trim();
    }

    if (sessionDurationMinutes !== undefined) {
      therapist.sessionDurationMinutes = sessionDurationMinutes;
    }

    if (isAvailable !== undefined) {
  therapist.isAvailable = isAvailable;
}

    // 12. Save updated profile
    await therapist.save();

    // 13. Send updated profile
    return res.status(200).json({
      success: true,
      message: "Therapist profile updated successfully",
      therapist,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// GET MY WEEKLY AVAILABILITY
// ==========================================

export const getMyAvailability = async (req, res, next) => {
  try {
    // Find logged-in therapist
    const therapist = await Therapist.findOne({
      user: req.user.userId,
    });

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: "Therapist profile not found",
      });
    }

    // Find therapist availability
    const availability = await Availability.findOne({
      therapist: therapist._id,
    });

    // Return default schedule if none exists
    if (!availability) {
      return res.status(200).json({
        success: true,
        availability: {
          weeklySchedule: [],
          timezone: "Asia/Kolkata",
          isActive: true,
        },
      });
    }

    return res.status(200).json({
      success: true,
      availability,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// UPDATE MY WEEKLY AVAILABILITY
// ==========================================

export const updateMyAvailability = async (req, res, next) => {
  try {
    const { weeklySchedule, timezone, isActive } = req.body;

    // Check allowed fields
    const allowedFields = ["weeklySchedule", "timezone", "isActive"];

    const invalidFields = Object.keys(req.body).filter(
      (field) => !allowedFields.includes(field),
    );

    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid fields: ${invalidFields.join(", ")}`,
      });
    }

    // Validate weekly schedule
    if (!Array.isArray(weeklySchedule)) {
      return res.status(400).json({
        success: false,
        message: "Weekly schedule must be an array",
      });
    }

    // Validate timezone
    if (
      timezone !== undefined &&
      (typeof timezone !== "string" || !timezone.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid timezone",
      });
    }

    // Validate availability status
    if (isActive !== undefined && typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false",
      });
    }

    // Find logged-in therapist
    const therapist = await Therapist.findOne({
      user: req.user.userId,
    });

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: "Therapist profile not found",
      });
    }

    // Find existing availability or create a new one
    let availability = await Availability.findOne({
      therapist: therapist._id,
    });

    if (!availability) {
      availability = new Availability({
        therapist: therapist._id,
      });
    }

    // Update provided fields
    availability.weeklySchedule = weeklySchedule;

    if (timezone !== undefined) {
      availability.timezone = timezone.trim();
    }

    if (isActive !== undefined) {
      availability.isActive = isActive;
    }

    // Save availability
    await availability.save();

    return res.status(200).json({
      success: true,
      message: "Availability updated successfully",
      availability,
    });
  } catch (error) {
    next(error);
  }
};
