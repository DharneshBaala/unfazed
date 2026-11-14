import express from "express";
import cors from "cors";
import errorHandler from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import therapistRoutes from "./routes/therapistRoutes.js";
import schedulingRoutes from "./routes/schedulingRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import clientIntakeRoutes from "./routes/clientIntakeRoutes.js";
import sessionNoteRoutes from "./routes/sessionNoteRoutes.js";import appointmentRoutes from "./routes/appointmentRoutes.js";


const app = express();

// CORS configuration
app.use(
  cors({
    origin:["http://localhost:5173",
            "http://localhost:5174",
          ],
    credentials: true,
  })
);

// Parse incoming JSON
app.use(express.json());


// Health check API
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Unfazed API is running successfully",
  });
});

// Auth routes
app.use("/api/auth", authRoutes);

// Therapist routes
app.use("/api/therapists", therapistRoutes);

// Scheduling routes
app.use("/api/scheduling", schedulingRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/client-intake", clientIntakeRoutes);
app.use("/api/session-notes", sessionNoteRoutes);
app.use("/api/appointments", appointmentRoutes);

// Handle unknown routes
app.use((req, res, next) => {
  const error = new Error("Route not found");
  error.statusCode = 404;

  next(error);
});

// Centralized error handler
app.use(errorHandler);

export default app;