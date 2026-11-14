import mongoose from "mongoose";

import Client from "../models/Client.js";
import Therapist from "../models/Therapist.js";
import TherapistClient from "../models/TherapistClient.js";
import ClientIntake from "../models/ClientIntake.js";

export const saveClientIntake = async (req, res, next) => {
  try {
    const { therapistId } = req.params;

    const {
      reasonForSeeking,
      therapyGoals,
      previousTherapy,
      additionalInformation,
      emergencyContact,
      consent,
      status,
    } = req.body;

    // 1. Validate therapist ID
    if (!mongoose.Types.ObjectId.isValid(therapistId)) {
      const error = new Error("Invalid therapist ID");
      error.statusCode = 400;
      throw error;
    }

    // 2. Validate allowed request fields
    const allowedFields = [
      "reasonForSeeking",
      "therapyGoals",
      "previousTherapy",
      "additionalInformation",
      "emergencyContact",
      "consent",
      "status",
    ];

    const unexpectedFields = Object.keys(req.body).filter(
      (field) => !allowedFields.includes(field)
    );

    if (unexpectedFields.length > 0) {
      const error = new Error("Invalid intake fields");
      error.statusCode = 400;
      throw error;
    }

    // 3. Validate status
    if (status !== undefined && !["draft", "submitted"].includes(status)) {
      const error = new Error("Invalid intake status");
      error.statusCode = 400;
      throw error;
    }

    // 4. Validate consent object
    if (
      consent !== undefined &&
      (
        !consent ||
        typeof consent !== "object" ||
        Array.isArray(consent) ||
        Object.keys(consent).some(
          (field) => !["therapy", "privacyPolicy"].includes(field)
        )
      )
    ) {
      const error = new Error("Invalid consent information");
      error.statusCode = 400;
      throw error;
    }

    if (
      consent?.therapy !== undefined &&
      typeof consent.therapy !== "boolean"
    ) {
      const error = new Error("Therapy consent must be true or false");
      error.statusCode = 400;
      throw error;
    }

    if (
      consent?.privacyPolicy !== undefined &&
      typeof consent.privacyPolicy !== "boolean"
    ) {
      const error = new Error("Privacy consent must be true or false");
      error.statusCode = 400;
      throw error;
    }

    // 5. Find the logged-in client
    const client = await Client.findOne({
      user: req.user.userId,
    });

    if (!client) {
      const error = new Error("Client profile not found");
      error.statusCode = 404;
      throw error;
    }

    // 6. Find the therapist
    const therapist = await Therapist.findById(therapistId);

    if (!therapist) {
      const error = new Error("Therapist not found");
      error.statusCode = 404;
      throw error;
    }

    // 7. Verify the client has an active relationship
    const relationship = await TherapistClient.findOne({
      therapist: therapist._id,
      client: client._id,
      status: "active",
    });

    if (!relationship) {
      const error = new Error(
        "You do not have an active relationship with this therapist"
      );
      error.statusCode = 403;
      throw error;
    }

    // 8. Find an existing intake
    let intake = await ClientIntake.findOne({
      therapist: therapist._id,
      client: client._id,
    });

    // Do not allow changes after submission
    if (intake?.status === "submitted") {
      const error = new Error("This intake has already been submitted");
      error.statusCode = 409;
      throw error;
    }

    // 9. Prepare intake data
    const intakeData = {};

    if (reasonForSeeking !== undefined) {
      intakeData.reasonForSeeking = reasonForSeeking;
    }

    if (therapyGoals !== undefined) {
      intakeData.therapyGoals = therapyGoals;
    }

    if (previousTherapy !== undefined) {
      intakeData.previousTherapy = previousTherapy;
    }

    if (additionalInformation !== undefined) {
      intakeData.additionalInformation = additionalInformation;
    }

    if (emergencyContact !== undefined) {
      intakeData.emergencyContact = emergencyContact;
    }

    // 10. Record consent only when explicitly provided
    if (consent !== undefined) {
      intakeData["consent.therapy"] = consent.therapy;
      intakeData["consent.privacyPolicy"] = consent.privacyPolicy;
    }

    // 11. Validate consent before final submission
    if (status === "submitted") {
      const therapyConsent =
        consent?.therapy ?? intake?.consent?.therapy ?? false;

      const privacyConsent =
        consent?.privacyPolicy ?? intake?.consent?.privacyPolicy ?? false;

      if (!therapyConsent || !privacyConsent) {
        const error = new Error(
          "Both therapy and privacy consent are required"
        );
        error.statusCode = 400;
        throw error;
      }

      intakeData.status = "submitted";
      intakeData.submittedAt = new Date();
      intakeData["consent.recordedAt"] = new Date();
      intakeData["consent.policyVersion"] = "1.0";
    } else {
      intakeData.status = "draft";
    }

    // 12. Save or update the intake
    if (intake) {
      intake = await ClientIntake.findOneAndUpdate(
        {
          therapist: therapist._id,
          client: client._id,
          status: "draft",
        },
        { $set: intakeData },
        { new: true, runValidators: true }
      );
    } else {
      intake = await ClientIntake.create({
        therapist: therapist._id,
        client: client._id,
        ...intakeData,
      });
    }

    res.status(200).json({
      success: true,
      message:
        intake.status === "submitted"
          ? "Client intake submitted successfully"
          : "Client intake draft saved successfully",
      intake,
    });
  } catch (error) {
    next(error);
  }
};


export const getClientIntake = async (req, res, next) => {
  try {
    const { clientId } = req.params;

    // 1. Validate client ID
    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      const error = new Error("Invalid client ID");
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

    // 3. Verify the client has an active relationship
    const relationship = await TherapistClient.findOne({
      therapist: therapist._id,
      client: clientId,
      status: "active",
    });

    if (!relationship) {
      const error = new Error("Client not found in your practice");
      error.statusCode = 404;
      throw error;
    }

    // 4. Retrieve only this therapist's submitted intake
    const intake = await ClientIntake.findOne({
      therapist: therapist._id,
      client: clientId,
      status: "submitted",
    });

    if (!intake) {
      const error = new Error("Submitted client intake not found");
      error.statusCode = 404;
      throw error;
    }

    // 5. Return intake information
    res.status(200).json({
      success: true,
      intake,
    });
  } catch (error) {
    next(error);
  }
};
