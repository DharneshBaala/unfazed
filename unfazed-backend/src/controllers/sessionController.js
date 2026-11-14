import mongoose from "mongoose";
import TherapistClient from "../models/TherapistClient.js";
import Therapist from "../models/Therapist.js";
import Availability from "../models/Availability.js";
import Session from "../models/Session.js";
import Client from "../models/Client.js";
import SessionSlotReservation from "../models/SessionSlotReservation.js";

// ==========================================
// HELPER FUNCTIONS
// ==========================================

// Get date and time parts in a particular timezone
const getLocalDateParts = (date, timezone) => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const values = {};

  parts.forEach((part) => {
    values[part.type] = part.value;
  });

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    weekday: values.weekday.toLowerCase(),
    hour: Number(values.hour),
    minute: Number(values.minute),
    date: `${values.year}-${values.month}-${values.day}`,
    time: `${values.hour}:${values.minute}`,
  };
};

const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const generateSlotsForWindow = (startTime, endTime, duration) => {
  const slots = [];

  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  for (let current = start; current + duration <= end; current += duration) {
    slots.push({
      startTime: minutesToTime(current),
      endTime: minutesToTime(current + duration),
    });
  }

  return slots;
};

const hasTimeOverlap = (startA, endA, startB, endB) => {
  return startA < endB && endA > startB;
};

const isQuarterHourAligned = (time) => {
  const minutes = timeToMinutes(time);
  return minutes % 15 === 0;
};

// Convert a local date and time into a UTC Date
const localDateTimeToUtc = (dateString, timeString, timezone) => {
  const [year, month, day] = dateString.split("-").map(Number);
  const [hours, minutes] = timeString.split(":").map(Number);

  const desiredUtcTime = Date.UTC(year, month - 1, day, hours, minutes);

  let result = new Date(desiredUtcTime);

  for (let i = 0; i < 3; i++) {
    const localParts = getLocalDateParts(result, timezone);

    const representedUtcTime = Date.UTC(
      localParts.year,
      localParts.month - 1,
      localParts.day,
      localParts.hour,
      localParts.minute,
    );

    const difference = representedUtcTime - desiredUtcTime;

    result = new Date(result.getTime() - difference);
  }

  const verifiedParts = getLocalDateParts(result, timezone);

  if (verifiedParts.date !== dateString || verifiedParts.time !== timeString) {
    return null;
  }

  return result;
};

const addOneDay = (dateString) => {
  const [year, month, day] = dateString.split("-").map(Number);

  const nextDate = new Date(Date.UTC(year, month - 1, day + 1));

  return `${nextDate.getUTCFullYear()}-${String(
    nextDate.getUTCMonth() + 1,
  ).padStart(2, "0")}-${String(nextDate.getUTCDate()).padStart(2, "0")}`;
};

// ==========================================
// GET AVAILABLE APPOINTMENT SLOTS
// ==========================================

export const getAvailableSlots = async (req, res, next) => {
  try {
    const { therapistId } = req.params;
    const { date } = req.query;

    if (!mongoose.Types.ObjectId.isValid(therapistId)) {
      const error = new Error("Invalid therapist ID");
      error.statusCode = 400;
      throw error;
    }

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const error = new Error("A valid date in YYYY-MM-DD format is required");
      error.statusCode = 400;
      throw error;
    }

    const [year, month, day] = date.split("-").map(Number);
    const checkedDate = new Date(Date.UTC(year, month - 1, day));

    if (
      checkedDate.getUTCFullYear() !== year ||
      checkedDate.getUTCMonth() + 1 !== month ||
      checkedDate.getUTCDate() !== day
    ) {
      const error = new Error("Invalid calendar date");
      error.statusCode = 400;
      throw error;
    }

    // 1. Find therapist

    const therapist = await Therapist.findById(therapistId);

    if (!therapist || !therapist.isApproved || !therapist.isAvailable) {
      const error = new Error("Therapist is not available");
      error.statusCode = 404;
      throw error;
    }

    // 2. Find therapist availability

    const availability = await Availability.findOne({
      therapist: therapist._id,
      isActive: true,
    });

    if (!availability) {
      const error = new Error("Therapist availability not found");
      error.statusCode = 404;
      throw error;
    }

    const timezone = availability.timezone;
    const duration = therapist.sessionDurationMinutes;

    // 3. Find weekday schedule

    const requestedDate = localDateTimeToUtc(date, "12:00", timezone);

    if (!requestedDate) {
      const error = new Error("Invalid date for therapist timezone");
      error.statusCode = 400;
      throw error;
    }

    const weekday = getLocalDateParts(requestedDate, timezone).weekday;

    console.log("DEBUG requestedDate:", requestedDate);
    console.log("DEBUG timezone:", timezone);
    console.log("DEBUG weekday:", weekday);
    console.log(
      "DEBUG saved weekdays:",
      availability.weeklySchedule.map((item) => item.day),
    );

    const daySchedule = availability.weeklySchedule.find(
      (item) => item.day.toLowerCase() === weekday,
    );

    if (!daySchedule || !daySchedule.slots.length) {
      return res.status(200).json({
        success: true,
        date,
        timezone,
        duration,
        count: 0,
        slots: [],
      });
    }

    // 4. Generate possible slots

    const possibleSlots = [];

    for (const window of daySchedule.slots) {
      const generatedSlots = generateSlotsForWindow(
        window.startTime,
        window.endTime,
        duration,
      );

      for (const slot of generatedSlots) {
        const startAt = localDateTimeToUtc(date, slot.startTime, timezone);

        const endAt = localDateTimeToUtc(date, slot.endTime, timezone);

        if (startAt && endAt) {
          possibleSlots.push({
            startAt,
            endAt,
            startTime: slot.startTime,
            endTime: slot.endTime,
          });
        }
      }
    }

    // 5. Find existing reserved appointments on this date

    const nextDate = addOneDay(date);

    const dayStart = localDateTimeToUtc(date, "00:00", timezone);

    const dayEnd = localDateTimeToUtc(nextDate, "00:00", timezone);

    const existingSessions = await Session.find({
      therapist: therapist._id,
      isSlotReserved: true,
      startAt: { $lt: dayEnd },
      endAt: { $gt: dayStart },
    }).select("startAt endAt");

    // 6. Remove booked and past slots

    const now = new Date();

    const availableSlots = possibleSlots.filter((slot) => {
      if (slot.startAt <= now) {
        return false;
      }

      return !existingSessions.some((session) =>
        hasTimeOverlap(
          slot.startAt.getTime(),
          slot.endAt.getTime(),
          session.startAt.getTime(),
          session.endAt.getTime(),
        ),
      );
    });

    return res.status(200).json({
      success: true,
      date,
      timezone,
      duration,
      count: availableSlots.length,
      slots: availableSlots.map((slot) => ({
        startAt: slot.startAt.toISOString(),
        endAt: slot.endAt.toISOString(),
        startTime: slot.startTime,
        endTime: slot.endTime,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// BOOK AN APPOINTMENT
// ==========================================

export const bookSession = async (req, res, next) => {
  let dbSession;

  try {
    const { therapistId, startAt, sessionType, clientMessage = "" } = req.body;

    // 1. Validate request

    if (!therapistId || !startAt || !sessionType) {
      const error = new Error(
        "Therapist, appointment time, and session type are required",
      );
      error.statusCode = 400;
      throw error;
    }

    if (!mongoose.Types.ObjectId.isValid(therapistId)) {
      const error = new Error("Invalid therapist ID");
      error.statusCode = 400;
      throw error;
    }

    // 2. Validate ISO 8601 date-time

    const isoDateTimeRegex =
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;

    if (typeof startAt !== "string" || !isoDateTimeRegex.test(startAt)) {
      const error = new Error(
        "Appointment time must be a valid ISO 8601 date-time",
      );
      error.statusCode = 400;
      throw error;
    }

    const appointmentStart = new Date(startAt);

    const isoDatePart = startAt.slice(0, 10);
    const [year, month, day] = isoDatePart.split("-").map(Number);

    const calendarDate = new Date(Date.UTC(year, month - 1, day));

    const isValidCalendarDate =
      calendarDate.getUTCFullYear() === year &&
      calendarDate.getUTCMonth() === month - 1 &&
      calendarDate.getUTCDate() === day;

    if (Number.isNaN(appointmentStart.getTime()) || !isValidCalendarDate) {
      const error = new Error("Invalid appointment date and time");
      error.statusCode = 400;
      throw error;
    }

    if (!["online", "in_person"].includes(sessionType)) {
      const error = new Error("Invalid session type");
      error.statusCode = 400;
      throw error;
    }

    if (typeof clientMessage !== "string" || clientMessage.length > 500) {
      const error = new Error(
        "Client message must be a string of maximum 500 characters",
      );
      error.statusCode = 400;
      throw error;
    }

    if (appointmentStart <= new Date()) {
      const error = new Error("Cannot book an appointment in the past");
      error.statusCode = 400;
      throw error;
    }

    // 3. Find logged-in client

    const client = await Client.findOne({
      user: req.user.userId,
    });

    if (!client) {
      const error = new Error("Client profile not found");
      error.statusCode = 404;
      throw error;
    }

    // 4. Find therapist

    const therapist = await Therapist.findById(therapistId);

    if (!therapist || !therapist.isApproved || !therapist.isAvailable) {
      const error = new Error("Therapist is not available");
      error.statusCode = 404;
      throw error;
    }

    // 5. Find therapist availability

    const availability = await Availability.findOne({
      therapist: therapist._id,
      isActive: true,
    });

    if (!availability) {
      const error = new Error("Therapist availability not found");
      error.statusCode = 404;
      throw error;
    }

    const timezone = availability.timezone;
    const duration = therapist.sessionDurationMinutes;

    // 6. Convert appointment into therapist local time

    const localParts = getLocalDateParts(appointmentStart, timezone);

    const localDate = localParts.date;
    const localTime = localParts.time;

    if (!isQuarterHourAligned(localTime)) {
      const error = new Error(
        "Appointment time must align with a 15-minute interval",
      );
      error.statusCode = 400;
      throw error;
    }

    // Verify the supplied time matches the therapist's local time

    const verifiedStart = localDateTimeToUtc(localDate, localTime, timezone);

    if (
      !verifiedStart ||
      verifiedStart.getTime() !== appointmentStart.getTime()
    ) {
      const error = new Error("Invalid appointment time");
      error.statusCode = 400;
      throw error;
    }

    // 7. Find weekday schedule
    // IMPORTANT: Compare weekdays without case sensitivity.

    const weekday = localParts.weekday.toLowerCase();

    const daySchedule = availability.weeklySchedule.find(
      (item) => String(item.day).trim().toLowerCase() === weekday,
    );

    if (!daySchedule) {
      const error = new Error("Therapist is not available on this day");
      error.statusCode = 400;
      throw error;
    }

    // 8. Check whether appointment fits inside an available window

    const requestedStartMinutes = timeToMinutes(localTime);
    const requestedEndMinutes = requestedStartMinutes + duration;

    const isWithinAvailability = daySchedule.slots.some((window) => {
      return (
        requestedStartMinutes >= timeToMinutes(window.startTime) &&
        requestedEndMinutes <= timeToMinutes(window.endTime)
      );
    });

    if (!isWithinAvailability) {
      const error = new Error(
        "Requested time is outside the therapist's available slots",
      );
      error.statusCode = 400;
      throw error;
    }

    // 9. Calculate appointment end time

    const endTime = minutesToTime(requestedEndMinutes);

    const appointmentEnd = localDateTimeToUtc(localDate, endTime, timezone);

    if (!appointmentEnd) {
      const error = new Error("Invalid appointment end time");
      error.statusCode = 400;
      throw error;
    }

    // 10. Start database transaction

    dbSession = await mongoose.startSession();

    let bookedAppointment;

    await dbSession.withTransaction(async () => {
      // Create appointment

      const createdSessions = await Session.create(
        [
          {
            therapist: therapist._id,
            client: client._id,
            startAt: appointmentStart,
            endAt: appointmentEnd,
            timezone,
            sessionType,
            status: "pending",
            isSlotReserved: true,
            clientMessage: clientMessage.trim(),
          },
        ],
        { session: dbSession },
      );

      bookedAppointment = createdSessions[0];

      // Reserve every 15-minute block

      const reservations = [];

      for (
        let current = appointmentStart.getTime();
        current < appointmentEnd.getTime();
        current += 15 * 60 * 1000
      ) {
        reservations.push({
          therapist: therapist._id,
          session: bookedAppointment._id,
          slotStartAt: new Date(current),
        });
      }

      await SessionSlotReservation.create(reservations, {
        session: dbSession,
        ordered: true,
      });

      // Create or reactivate the therapist-client relationship

      await TherapistClient.findOneAndUpdate(
        {
          therapist: therapist._id,
          client: client._id,
        },
        {
          $set: {
            status: "active",
          },
        },
        {
          upsert: true,
          new: true,
          session: dbSession,
          setDefaultsOnInsert: true,
        },
      );
    });

    // 11. Send response

    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      session: {
        id: bookedAppointment._id,
        therapist: bookedAppointment.therapist,
        startAt: bookedAppointment.startAt,
        endAt: bookedAppointment.endAt,
        timezone: bookedAppointment.timezone,
        duration,
        sessionType: bookedAppointment.sessionType,
        status: bookedAppointment.status,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      error.statusCode = 409;
      error.message = "This appointment slot is no longer available";
    }

    next(error);
  } finally {
    if (dbSession) {
      await dbSession.endSession();
    }
  }
};

// ==========================================
// CANCEL AN APPOINTMENT
// ==========================================

export const cancelSession = async (req, res, next) => {
  let dbSession;

  try {
    const { sessionId } = req.params;
    const cancellationReason = req.body?.cancellationReason ?? "";

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      const error = new Error("Invalid appointment ID");
      error.statusCode = 400;
      throw error;
    }

    if (
      typeof cancellationReason !== "string" ||
      cancellationReason.length > 500
    ) {
      const error = new Error(
        "Cancellation reason must be a string of maximum 500 characters",
      );
      error.statusCode = 400;
      throw error;
    }

    // 1. Identify the logged-in user's appointment ownership

    let ownerQuery = {};

    if (req.user.role === "client") {
      const client = await Client.findOne({
        user: req.user.userId,
      });

      if (!client) {
        const error = new Error("Client profile not found");
        error.statusCode = 404;
        throw error;
      }

      ownerQuery.client = client._id;
    } else if (req.user.role === "therapist") {
      const therapist = await Therapist.findOne({
        user: req.user.userId,
      });

      if (!therapist) {
        const error = new Error("Therapist profile not found");
        error.statusCode = 404;
        throw error;
      }

      ownerQuery.therapist = therapist._id;
    } else {
      const error = new Error("You are not authorized to cancel appointments");
      error.statusCode = 403;
      throw error;
    }

    // 2. Start transaction

    dbSession = await mongoose.startSession();

    let cancelledAppointment;

    await dbSession.withTransaction(async () => {
      const appointment = await Session.findOne({
        _id: sessionId,
        ...ownerQuery,
      }).session(dbSession);

      if (!appointment) {
        const error = new Error("Appointment not found");
        error.statusCode = 404;
        throw error;
      }

      if (appointment.status === "completed") {
        const error = new Error("Completed appointments cannot be cancelled");
        error.statusCode = 400;
        throw error;
      }

      if (appointment.status === "cancelled") {
        const error = new Error("Appointment is already cancelled");
        error.statusCode = 400;
        throw error;
      }

      // 3. Update appointment

      appointment.status = "cancelled";
      appointment.isSlotReserved = false;
      appointment.cancellationReason = cancellationReason.trim();
      appointment.cancelledBy = req.user.userId;

      await appointment.save({ session: dbSession });

      // 4. Release reserved time blocks

      await SessionSlotReservation.deleteMany({
        session: appointment._id,
      }).session(dbSession);

      cancelledAppointment = appointment;
    });

    return res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      session: {
        id: cancelledAppointment._id,
        status: cancelledAppointment.status,
        cancellationReason: cancelledAppointment.cancellationReason,
      },
    });
  } catch (error) {
    next(error);
  } finally {
    if (dbSession) {
      await dbSession.endSession();
    }
  }
};

// ==========================================
// GET MY APPOINTMENTS
// ==========================================

export const getMySessions = async (req, res, next) => {
  try {
    let ownerQuery = {};

    // 1. Identify the logged-in user

    if (req.user.role === "client") {
      const client = await Client.findOne({
        user: req.user.userId,
      });

      if (!client) {
        const error = new Error("Client profile not found");
        error.statusCode = 404;
        throw error;
      }

      ownerQuery.client = client._id;
    } else if (req.user.role === "therapist") {
      const therapist = await Therapist.findOne({
        user: req.user.userId,
      });

      if (!therapist) {
        const error = new Error("Therapist profile not found");
        error.statusCode = 404;
        throw error;
      }

      ownerQuery.therapist = therapist._id;
    } else {
      const error = new Error("You are not authorized");
      error.statusCode = 403;
      throw error;
    }

    // 2. Read and validate pagination values

    const {
      page = "1",
      limit = "10",
      status,
      startDate,
      endDate,
      timezone = "Asia/Kolkata",
    } = req.query;

    const currentPage = Number(page);
    const pageSize = Number(limit);

    if (
      !Number.isInteger(currentPage) ||
      !Number.isInteger(pageSize) ||
      currentPage < 1 ||
      pageSize < 1 ||
      pageSize > 50
    ) {
      const error = new Error(
        "Page must be a positive integer and limit must be between 1 and 50",
      );
      error.statusCode = 400;
      throw error;
    }

    // 3. Validate appointment status filter

    const allowedStatuses = [
      "pending",
      "confirmed",
      "cancelled",
      "completed",
      "no_show",
    ];

    if (status && !allowedStatuses.includes(status)) {
      const error = new Error("Invalid appointment status");
      error.statusCode = 400;
      throw error;
    }

    if (status) {
      ownerQuery.status = status;
    }

    // 4. Validate timezone

    try {
      Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
      });
    } catch {
      const error = new Error("Invalid timezone");
      error.statusCode = 400;
      throw error;
    }

    // 5. Validate date format and actual calendar dates

    const isValidDate = (date) => {
      if (!date) return true;

      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return false;
      }

      const [year, month, day] = date.split("-").map(Number);

      const parsedDate = new Date(Date.UTC(year, month - 1, day));

      return (
        parsedDate.getUTCFullYear() === year &&
        parsedDate.getUTCMonth() + 1 === month &&
        parsedDate.getUTCDate() === day
      );
    };

    if (!isValidDate(startDate) || !isValidDate(endDate)) {
      const error = new Error("Dates must be valid and use YYYY-MM-DD format");
      error.statusCode = 400;
      throw error;
    }

    // 6. Validate date range

    if (startDate && endDate && startDate > endDate) {
      const error = new Error("Start date cannot be later than end date");
      error.statusCode = 400;
      throw error;
    }

    // 7. Apply date-range filter

    if (startDate || endDate) {
      ownerQuery.startAt = {};

      if (startDate) {
        const rangeStart = localDateTimeToUtc(startDate, "00:00", timezone);

        if (!rangeStart) {
          const error = new Error("Invalid start date for timezone");
          error.statusCode = 400;
          throw error;
        }

        ownerQuery.startAt.$gte = rangeStart;
      }

      if (endDate) {
        const nextDate = addOneDay(endDate);

        const rangeEnd = localDateTimeToUtc(nextDate, "00:00", timezone);

        if (!rangeEnd) {
          const error = new Error("Invalid end date for timezone");
          error.statusCode = 400;
          throw error;
        }

        ownerQuery.startAt.$lt = rangeEnd;
      }
    }

    // 8. Count all matching appointments

    const totalAppointments = await Session.countDocuments(ownerQuery);

    // 9. Calculate pagination

    const totalPages = Math.ceil(totalAppointments / pageSize);
    const skip = (currentPage - 1) * pageSize;

    // 10. Fetch only the requested page

    const sessions = await Session.find(ownerQuery)
      .populate("therapist", "specialization qualification")
      .populate({
        path: "client",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .sort({ startAt: -1 })
      .skip(skip)
      .limit(pageSize);

    // 11. Send response

    return res.status(200).json({
      success: true,
      count: sessions.length,
      pagination: {
        currentPage,
        pageSize,
        totalAppointments,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1 && totalAppointments > 0,
      },
      sessions,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// CONFIRM AN APPOINTMENT
// ==========================================

export const confirmSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    // 1. Validate appointment ID

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      const error = new Error("Invalid appointment ID");
      error.statusCode = 400;
      throw error;
    }

    // 2. Find the logged-in therapist

    const therapist = await Therapist.findOne({
      user: req.user.userId,
    });

    if (!therapist) {
      const error = new Error("Therapist profile not found");
      error.statusCode = 404;
      throw error;
    }

    // 3. Find appointment belonging to this therapist

    const appointment = await Session.findOne({
      _id: sessionId,
      therapist: therapist._id,
    });

    if (!appointment) {
      const error = new Error("Appointment not found");
      error.statusCode = 404;
      throw error;
    }

    // 4. Only pending appointments can be confirmed

    if (appointment.status !== "pending") {
      const error = new Error("Only pending appointments can be confirmed");
      error.statusCode = 400;
      throw error;
    }

    // 5. Update appointment status

    appointment.status = "confirmed";

    await appointment.save();

    // 6. Send response

    return res.status(200).json({
      success: true,
      message: "Appointment confirmed successfully",
      session: {
        id: appointment._id,
        status: appointment.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// COMPLETE AN APPOINTMENT
// ==========================================

export const completeSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    // 1. Validate appointment ID

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      const error = new Error("Invalid appointment ID");
      error.statusCode = 400;
      throw error;
    }

    // 2. Find the logged-in therapist

    const therapist = await Therapist.findOne({
      user: req.user.userId,
    });

    if (!therapist) {
      const error = new Error("Therapist profile not found");
      error.statusCode = 404;
      throw error;
    }

    // 3. Find appointment belonging to this therapist

    const appointment = await Session.findOne({
      _id: sessionId,
      therapist: therapist._id,
    });

    if (!appointment) {
      const error = new Error("Appointment not found");
      error.statusCode = 404;
      throw error;
    }

    // 4. Only confirmed appointments can be completed

    if (appointment.status !== "confirmed") {
      const error = new Error("Only confirmed appointments can be completed");
      error.statusCode = 400;
      throw error;
    }

    // 5. Check whether the scheduled session has ended

    if (appointment.endAt > new Date()) {
      const error = new Error(
        "Appointment cannot be completed before its scheduled end time",
      );
      error.statusCode = 400;
      throw error;
    }

    // 6. Update appointment status

    appointment.status = "completed";

    await appointment.save();

    // 7. Send response

    return res.status(200).json({
      success: true,
      message: "Appointment marked as completed successfully",
      session: {
        id: appointment._id,
        status: appointment.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// MARK AN APPOINTMENT AS NO-SHOW
// ==========================================

export const markNoShow = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    // 1. Validate appointment ID

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      const error = new Error("Invalid appointment ID");
      error.statusCode = 400;
      throw error;
    }

    // 2. Find the logged-in therapist

    const therapist = await Therapist.findOne({
      user: req.user.userId,
    });

    if (!therapist) {
      const error = new Error("Therapist profile not found");
      error.statusCode = 404;
      throw error;
    }

    // 3. Find appointment belonging to this therapist

    const appointment = await Session.findOne({
      _id: sessionId,
      therapist: therapist._id,
    });

    if (!appointment) {
      const error = new Error("Appointment not found");
      error.statusCode = 404;
      throw error;
    }

    // 4. Only confirmed appointments can become no-show

    if (appointment.status !== "confirmed") {
      const error = new Error(
        "Only confirmed appointments can be marked as no-show",
      );
      error.statusCode = 400;
      throw error;
    }

    // 5. Check whether the scheduled session has ended

    if (appointment.endAt > new Date()) {
      const error = new Error(
        "Appointment cannot be marked as no-show before its scheduled end time",
      );
      error.statusCode = 400;
      throw error;
    }

    // 6. Update appointment status

    appointment.status = "no_show";

    await appointment.save();

    // 7. Send response

    return res.status(200).json({
      success: true,
      message: "Appointment marked as no-show successfully",
      session: {
        id: appointment._id,
        status: appointment.status,
      },
    });
  } catch (error) {
    next(error);
  }
};
