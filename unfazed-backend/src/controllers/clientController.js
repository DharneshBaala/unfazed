import Therapist from "../models/Therapist.js";
import TherapistClient from "../models/TherapistClient.js";
import mongoose from "mongoose";
import Client from "../models/Client.js";
import User from "../models/User.js";

// ==========================================
// GET ALL CLIENTS
// ==========================================

export const getMyClients = async (req, res, next) => {
  try {
    // 1. Find the therapist profile.
    const therapist = await Therapist.findOne({
      user: req.user.userId,
    });

    if (!therapist) {
      const error = new Error("Therapist profile not found");
      error.statusCode = 404;
      throw error;
    }

    // 2. Read and validate relationship status filter.
    const { search, status } = req.query;

    if (status !== undefined && !["active", "inactive"].includes(status)) {
      const error = new Error("Status must be either active or inactive");
      error.statusCode = 400;
      throw error;
    }

    // 3. Build therapist-specific query.
    const relationshipQuery = {
      therapist: therapist._id,
    };

    if (status) {
      relationshipQuery.status = status;
    }

    // 4. Find therapist's clients.
    const relationships = await TherapistClient.find(
      relationshipQuery,
    ).populate({
      path: "client",
      populate: {
        path: "user",
        select: "name email",
      },
    });

    // 5. Validate search.
    if (search !== undefined) {
      if (
        typeof search !== "string" ||
        search.trim().length === 0 ||
        search.trim().length > 100
      ) {
        const error = new Error("Search must be 1–100 characters");
        error.statusCode = 400;
        throw error;
      }
    }

    // 6. Search clients by name or email.
    const filteredRelationships = search
      ? relationships.filter((relationship) => {
          const user = relationship.client?.user;

          if (!user) return false;

          const searchText = search.trim().toLowerCase();

          return (
            user.name.toLowerCase().includes(searchText) ||
            user.email.toLowerCase().includes(searchText)
          );
        })
      : relationships;

    // 7. Read pagination parameters.
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);

    // 8. Validate pagination.
    if (
      !Number.isInteger(page) ||
      !Number.isInteger(limit) ||
      page < 1 ||
      limit < 1 ||
      limit > 50
    ) {
      const error = new Error(
        "Page must be a positive integer and limit must be between 1 and 50",
      );
      error.statusCode = 400;
      throw error;
    }

    // 9. Calculate pagination.
    const totalClients = filteredRelationships.length;
    const totalPages = Math.ceil(totalClients / limit);
    const skip = (page - 1) * limit;

    // 10. Select clients for the requested page.
    const paginatedRelationships = filteredRelationships.slice(
      skip,
      skip + limit,
    );

    // 11. Format client data.
    const clients = paginatedRelationships
      .filter((relationship) => relationship.client?.user)
      .map((relationship) => ({
        relationshipId: relationship._id,
        clientId: relationship.client._id,
        name: relationship.client.user.name,
        email: relationship.client.user.email,
        phone: relationship.client.phone,
        relationshipStatus: relationship.status,
        connectedAt: relationship.createdAt,
      }));

    // 12. Send response.
    return res.status(200).json({
      success: true,
      count: clients.length,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalClients,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      clients,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// GET INDIVIDUAL CLIENT
// ==========================================

export const getClientById = async (req, res, next) => {
  try {
    const { clientId } = req.params;

    // 1. Validate client ID.
    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      const error = new Error("Invalid client ID");
      error.statusCode = 400;
      throw error;
    }

    // 2. Find logged-in therapist.
    const therapist = await Therapist.findOne({
      user: req.user.userId,
    });

    if (!therapist) {
      const error = new Error("Therapist profile not found");
      error.statusCode = 404;
      throw error;
    }

    // 3. Verify therapist-client relationship.
    const relationship = await TherapistClient.findOne({
      therapist: therapist._id,
      client: clientId,
      status: "active",
    }).populate({
      path: "client",
      populate: {
        path: "user",
        select: "name email",
      },
    });

    if (!relationship || !relationship.client?.user) {
      const error = new Error("Client not found in your practice");
      error.statusCode = 404;
      throw error;
    }

    // 4. Return client details.
    const client = relationship.client;

    return res.status(200).json({
      success: true,
      client: {
        relationshipId: relationship._id,
        clientId: client._id,
        name: client.user.name,
        email: client.user.email,
        phone: client.phone,
        dateOfBirth: client.dateOfBirth,
        intakeCompleted: client.intakeCompleted,
        relationshipStatus: relationship.status,
        connectedAt: relationship.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// UPDATE CLIENT PROFILE
// ==========================================

export const updateClient = async (req, res, next) => {
  try {
    const { clientId } = req.params;
    const { phone, dateOfBirth } = req.body;

    // 1. Validate client ID.
    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      const error = new Error("Invalid client ID");
      error.statusCode = 400;
      throw error;
    }

    // 2. Validate permitted fields.
    const allowedFields = ["phone", "dateOfBirth"];
    const providedFields = Object.keys(req.body);

    if (
      providedFields.length === 0 ||
      providedFields.some((field) => !allowedFields.includes(field))
    ) {
      const error = new Error("Invalid or missing update fields");
      error.statusCode = 400;
      throw error;
    }

    // 3. Validate phone number.
    if (phone !== undefined) {
      if (typeof phone !== "string" || phone.length > 20) {
        const error = new Error(
          "Phone must be a string of maximum 20 characters",
        );
        error.statusCode = 400;
        throw error;
      }
    }

    // 4. Validate date of birth.
    let parsedDateOfBirth;

    if (dateOfBirth !== undefined) {
      if (dateOfBirth === null || dateOfBirth === "") {
        parsedDateOfBirth = null;
      } else {
        if (
          typeof dateOfBirth !== "string" ||
          !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)
        ) {
          const error = new Error("Date of birth must use YYYY-MM-DD format");
          error.statusCode = 400;
          throw error;
        }

        const date = new Date(`${dateOfBirth}T00:00:00.000Z`);

        if (
          Number.isNaN(date.getTime()) ||
          date.toISOString().slice(0, 10) !== dateOfBirth
        ) {
          const error = new Error("Invalid date of birth");
          error.statusCode = 400;
          throw error;
        }

        if (date > new Date()) {
          const error = new Error("Date of birth cannot be in the future");
          error.statusCode = 400;
          throw error;
        }

        parsedDateOfBirth = date;
      }
    }

    // 5. Find logged-in therapist.
    const therapist = await Therapist.findOne({
      user: req.user.userId,
    });

    if (!therapist) {
      const error = new Error("Therapist profile not found");
      error.statusCode = 404;
      throw error;
    }

    // 6. Verify client belongs to therapist's practice.
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

    // 7. Update permitted fields.
    const updates = {};

    if (phone !== undefined) {
      updates.phone = phone.trim();
    }

    if (dateOfBirth !== undefined) {
      updates.dateOfBirth = parsedDateOfBirth;
    }

    const client = await Client.findByIdAndUpdate(
      clientId,
      { $set: updates },
      { new: true, runValidators: true },
    ).populate({
      path: "user",
      select: "name email",
    });

    return res.status(200).json({
      success: true,
      message: "Client profile updated successfully",
      client: {
        clientId: client._id,
        name: client.user.name,
        email: client.user.email,
        phone: client.phone,
        dateOfBirth: client.dateOfBirth,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateClientRelationshipStatus = async (req, res, next) => {
  try {
    const { clientId } = req.params;
    const { status } = req.body;

    // 1. Validate client ID
    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      const error = new Error("Invalid client ID");
      error.statusCode = 400;
      throw error;
    }

    // 2. Validate relationship status
    if (!["active", "inactive"].includes(status)) {
      const error = new Error("Status must be either active or inactive");
      error.statusCode = 400;
      throw error;
    }

    // 3. Find the logged-in therapist
    const therapist = await Therapist.findOne({
      user: req.user.userId,
    });

    if (!therapist) {
      const error = new Error("Therapist profile not found");
      error.statusCode = 404;
      throw error;
    }

    // 4. Update only this therapist-client relationship
    const relationship = await TherapistClient.findOneAndUpdate(
      {
        therapist: therapist._id,
        client: clientId,
      },
      {
        $set: { status },
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!relationship) {
      const error = new Error("Client not found in your practice");
      error.statusCode = 404;
      throw error;
    }

    // 5. Send response
    res.status(200).json({
      success: true,
      message: `Client relationship ${status} successfully`,
      relationship: {
        clientId: relationship.client,
        status: relationship.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// INVITE CLIENT
// ==========================================

export const inviteClient = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email || typeof email !== "string") {
      return res.status(400).json({
        success: false,
        message: "Client email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find registered client account
    const user = await User.findOne({
      email: normalizedEmail,
      role: "client",
      isActive: true,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No active client account found with this email",
      });
    }

    // Find client's profile
    const client = await Client.findOne({
      user: user._id,
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client profile not found",
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

    // Prevent therapist from inviting themselves
    if (user._id.toString() === therapist.user.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot invite yourself",
      });
    }

    // Check existing relationship
    const existingRelationship = await TherapistClient.findOne({
      therapist: therapist._id,
      client: client._id,
    });

    if (existingRelationship) {
      return res.status(409).json({
        success: false,
        message:
          existingRelationship.status === "pending"
            ? "An invitation is already pending"
            : "This client is already connected or has an existing relationship",
      });
    }

    // Create pending invitation
    const invitation = await TherapistClient.create({
      therapist: therapist._id,
      client: client._id,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Client invitation created successfully",
      invitation: {
        id: invitation._id,
        clientName: user.name,
        email: user.email,
        status: invitation.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// GET MY CLIENT INVITATIONS
// ==========================================

export const getMyInvitations = async (req, res, next) => {
  try {
    // Find the logged-in client's profile
    const client = await Client.findOne({
      user: req.user.userId,
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client profile not found",
      });
    }

    // Find pending invitations
    const invitations = await TherapistClient.find({
      client: client._id,
      status: "pending",
    })
      .populate({
        path: "therapist",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: invitations.length,
      invitations: invitations.map((invitation) => ({
        id: invitation._id,
        therapistName: invitation.therapist?.user?.name || "Therapist",
        therapistEmail: invitation.therapist?.user?.email || "",
        specialization: invitation.therapist?.specialization || "",
        status: invitation.status,
        invitedAt: invitation.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// RESPOND TO CLIENT INVITATION
// ==========================================

export const respondToInvitation = async (req, res, next) => {
  try {
    const { invitationId } = req.params;
    const { action } = req.body;

    // Validate invitation ID
    if (!mongoose.Types.ObjectId.isValid(invitationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid invitation ID",
      });
    }

    // Validate response
    if (!["accept", "reject"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Action must be accept or reject",
      });
    }

    // Find logged-in client's profile
    const client = await Client.findOne({
      user: req.user.userId,
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client profile not found",
      });
    }

    // Only the invited client can respond to their pending invitation
    const invitation = await TherapistClient.findOne({
      _id: invitationId,
      client: client._id,
      status: "pending",
    });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: "Pending invitation not found",
      });
    }

    invitation.status = action === "accept" ? "active" : "rejected";

    await invitation.save();

    return res.status(200).json({
      success: true,
      message:
        action === "accept"
          ? "Therapist invitation accepted successfully"
          : "Therapist invitation rejected successfully",
      invitation: {
        id: invitation._id,
        status: invitation.status,
      },
    });
  } catch (error) {
    next(error);
  }
};