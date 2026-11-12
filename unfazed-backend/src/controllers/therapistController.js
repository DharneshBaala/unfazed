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
    } = req.body;

    
    // 2. Check whether at least one field was provided
    const allowedFields = [
      "specialization",
      "qualification",
      "experience",
      "bio",
    ];

    const providedFields = Object.keys(req.body);

    if (providedFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one field to update",
      });
    }

    // 3. Reject fields that are not allowed
    const invalidFields = providedFields.filter(
      (field) => !allowedFields.includes(field)
    );

    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `You cannot update these fields: ${invalidFields.join(", ")}`,
      });
    }

    // 4. Validate specialization
    if (specialization !== undefined) {
      if (
        typeof specialization !== "string" ||
        !specialization.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Specialization cannot be empty",
        });
      }
    }

    // 5. Validate qualification
    if (qualification !== undefined) {
      if (
        typeof qualification !== "string" ||
        !qualification.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Qualification cannot be empty",
        });
      }
    }

    // 6. Validate experience
    if (experience !== undefined) {
      const experienceNumber = Number(experience);

      if (
        !Number.isFinite(experienceNumber) ||
        experienceNumber < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Experience must be a valid non-negative number",
        });
      }
    }

    // 7. Validate bio
    if (bio !== undefined) {
      if (
        typeof bio !== "string" ||
        bio.length > 1000
      ) {
        return res.status(400).json({
          success: false,
          message: "Bio must be text and cannot exceed 1000 characters",
        });
      }
    }

    
    // 8. Find logged-in therapist profile
    const therapist = await Therapist.findOne({
      user: req.user.userId,
    });

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: "Therapist profile not found",
      });
    }

    // 9. Update only the provided fields
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

    // 10. Save updated profile
    await therapist.save();

    // 11. Send updated profile
    return res.status(200).json({
      success: true,
      message: "Therapist profile updated successfully",
      therapist,
    });

  } catch (error) {
    next(error);
  }
};

