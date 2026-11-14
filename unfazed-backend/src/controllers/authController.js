import User from "../models/User.js";
import Client from "../models/Client.js";
import Therapist from "../models/Therapist.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

// ==========================================
// REGISTER CLIENT
// ==========================================

export const registerUser = async (req, res, next) => {
  let session;

  try {
    const { name, email, password } = req.body;

    // 1. Validate required fields
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid name, email and password",
      });
    }

    // 2. Validate password length
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters",
      });
    }

    // 3. Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // 4. Check existing email
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    // 5. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 6. Start transaction
    session = await mongoose.startSession();
    session.startTransaction();

    // 7. Create User
    const [newUser] = await User.create(
      [
        {
          name: name.trim(),
          email: normalizedEmail,
          password: hashedPassword,
          role: "client",
        },
      ],
      { session }
    );

    // 8. Create Client profile
    await Client.create(
      [
        {
          user: newUser._id,
        },
      ],
      { session }
    );

    // 9. Commit transaction
    await session.commitTransaction();

    // 10. Send success response
    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });

  } catch (error) {
    if (session?.inTransaction()) {
      await session.abortTransaction();
    }

    next(error);

  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

// ==========================================
// LOGIN USER
// ==========================================

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // 2. Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // 3. Find user and include password
    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    // 4. Check whether user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 5. Check whether account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive",
      });
    }

    // 6. Compare passwords
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 7. Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      }
    );

    // 8. Send successful response
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    next(error);
  }
};

// ==========================================
// GET CURRENT USER
// ==========================================

export const getCurrentUser = async (req, res, next) => {
  try {
    // 1. Find authenticated user
    const user = await User.findById(req.user.userId);

    // 2. Check whether user exists and is active
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User account not found or inactive",
      });
    }

    // 3. Return user details
    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    next(error);
  }
};

// ==========================================
// REGISTER THERAPIST
// ==========================================

export const registerTherapist = async (req, res, next) => {
  
  let session;

  try {
    // 1. Get registration details
    const {
      name,
      email,
      password,
      specialization,
      qualification,
      experience,
      bio,
    } = req.body;

    // 2. Validate required fields
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof specialization !== "string" ||
      typeof qualification !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !password ||
      !specialization.trim() ||
      !qualification.trim() ||
      experience === undefined ||
      experience === null
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // 3. Validate password length
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    // 4. Validate experience
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

    // 5. Normalize and validate email
    const normalizedEmail = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // 6. Check whether email is already registered
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    // 7. Hash therapist password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 8. Start MongoDB transaction
    session = await mongoose.startSession();

    session.startTransaction();


    // 9. Create therapist User account
    const [newUser] = await User.create(
      [
        {
          name: name.trim(),
          email: normalizedEmail,
          password: hashedPassword,
          role: "therapist",
        },
      ],
      { session }
    );


    // 10. Create therapist profile
    const [newTherapist] = await Therapist.create(
      [
        {
          user: newUser._id,
          specialization: specialization.trim(),
          qualification: qualification.trim(),
          experience: experienceNumber,
          bio: typeof bio === "string" ? bio.trim() : "",
          isApproved: false,
          isAvailable: true,
        },
      ],
      { session }
    );


    // 11. Commit transaction
    await session.commitTransaction();

    // 12. Send successful response
    return res.status(201).json({
      success: true,
      message: "Therapist account created successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      therapist: {
        id: newTherapist._id,
        specialization: newTherapist.specialization,
        qualification: newTherapist.qualification,
        experience: newTherapist.experience,
        isApproved: newTherapist.isApproved,
      },
    });

  } catch (error) {
    if (session?.inTransaction()) {
      await session.abortTransaction();
    }

    next(error);

  } finally {
    if (session) {
      await session.endSession();
    }
  }
};
