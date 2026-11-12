import express from "express";
import cors from "cors";
import errorHandler from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import therapistRoutes from "./routes/therapistRoutes.js";
import schedulingRoutes from "./routes/schedulingRoutes.js";


const app = express();

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173",
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


// Handle unknown routes
app.use((req, res, next) => {
  const error = new Error("Route not found");
  error.statusCode = 404;

  next(error);
});

// Centralized error handler
app.use(errorHandler);

export default app;