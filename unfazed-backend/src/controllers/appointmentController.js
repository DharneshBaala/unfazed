import Appointment from "../models/Appointment.js";
import Therapist from "../models/Therapist.js";
import TherapistClient from "../models/TherapistClient.js";

// ==========================================
// CREATE APPOINTMENT
// ==========================================

export const createAppointment = async (req, res) => {
  try {
    const {
      clientId,
      date,
      startTime,
      endTime,
      type,
      notes,
    } = req.body;

    // Validate required fields
    if (!clientId || !date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Client, date, start time and end time are required.",
      });
    }

    // Validate time format
    const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (!timePattern.test(startTime) || !timePattern.test(endTime)) {
      return res.status(400).json({
        success: false,
        message: "Invalid time format. Use HH:mm.",
      });
    }

    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time.",
      });
    }

    // Find logged-in therapist
    const therapist = await Therapist.findOne({
      user: req.user.userId,
    });

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: "Therapist profile not found.",
      });
    }

    // Verify active therapist-client relationship
    const relationship = await TherapistClient.findOne({
      therapist: therapist._id,
      client: clientId,
      status: "active",
    });

    if (!relationship) {
      return res.status(403).json({
        success: false,
        message: "You can only schedule appointments with active clients.",
      });
    }

    // Prepare appointment date
    const appointmentDate = new Date(date);

    if (Number.isNaN(appointmentDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment date.",
      });
    }

    // Check for overlapping therapist appointments
    const dayStart = new Date(appointmentDate);
    dayStart.setUTCHours(0, 0, 0, 0);

    const dayEnd = new Date(appointmentDate);
    dayEnd.setUTCHours(23, 59, 59, 999);

    const existingAppointment = await Appointment.findOne({
      therapist: therapist._id,
      date: { $gte: dayStart, $lte: dayEnd },
      status: "scheduled",
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });

    if (existingAppointment) {
      return res.status(409).json({
        success: false,
        message: "You already have an appointment during this time.",
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      therapist: therapist._id,
      client: clientId,
      date: appointmentDate,
      startTime,
      endTime,
      type: type || "online",
      notes,
    });

    return res.status(201).json({
      success: true,
      message: "Appointment created successfully.",
      appointment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ==========================================
// GET THERAPIST APPOINTMENTS
// ==========================================

export const getMyAppointments = async (req, res) => {
  try {
    const therapist = await Therapist.findOne({
      user: req.user.userId,
    });

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: "Therapist profile not found.",
      });
    }

    const filter = {
      therapist: therapist._id,
    };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const appointments = await Appointment.find(filter)
      .populate({
        path: "client",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .sort({ date: 1, startTime: 1 });

    return res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// UPDATE APPOINTMENT
// ==========================================

export const updateAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const {
      date,
      startTime,
      endTime,
      type,
      notes,
    } = req.body;

    const therapist = await Therapist.findOne({
      user: req.user.userId,
    });

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: "Therapist profile not found.",
      });
    }

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      therapist: therapist._id,
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found.",
      });
    }

    if (appointment.status !== "scheduled") {
      return res.status(400).json({
        success: false,
        message: "Only scheduled appointments can be updated.",
      });
    }

    const updatedDate = date ? new Date(date) : appointment.date;
    const updatedStartTime = startTime || appointment.startTime;
    const updatedEndTime = endTime || appointment.endTime;

    if (Number.isNaN(updatedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment date.",
      });
    }

    const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (
      !timePattern.test(updatedStartTime) ||
      !timePattern.test(updatedEndTime) ||
      updatedStartTime >= updatedEndTime
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid appointment time.",
      });
    }

    const dayStart = new Date(updatedDate);
    dayStart.setUTCHours(0, 0, 0, 0);

    const dayEnd = new Date(updatedDate);
    dayEnd.setUTCHours(23, 59, 59, 999);

    const conflictingAppointment = await Appointment.findOne({
      _id: { $ne: appointmentId },
      therapist: therapist._id,
      date: { $gte: dayStart, $lte: dayEnd },
      status: "scheduled",
      startTime: { $lt: updatedEndTime },
      endTime: { $gt: updatedStartTime },
    });

    if (conflictingAppointment) {
      return res.status(409).json({
        success: false,
        message: "Another appointment already exists during this time.",
      });
    }

    appointment.date = updatedDate;
    appointment.startTime = updatedStartTime;
    appointment.endTime = updatedEndTime;

    if (type !== undefined) appointment.type = type;
    if (notes !== undefined) appointment.notes = notes;

    await appointment.save();

    return res.status(200).json({
      success: true,
      message: "Appointment updated successfully.",
      appointment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ==========================================
// CANCEL APPOINTMENT
// ==========================================

export const cancelAppointment = async (req, res) => {
  try {
    const therapist = await Therapist.findOne({
      user: req.user.userId,
    });

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: "Therapist profile not found.",
      });
    }

    const appointment = await Appointment.findOne({
      _id: req.params.appointmentId,
      therapist: therapist._id,
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found.",
      });
    }

    if (appointment.status !== "scheduled") {
      return res.status(400).json({
        success: false,
        message: "Only scheduled appointments can be cancelled.",
      });
    }

    appointment.status = "cancelled";
    await appointment.save();

    return res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully.",
      appointment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};