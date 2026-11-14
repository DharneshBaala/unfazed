import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Public pages
import Home from "../pages/public/Home";
import About from "../pages/public/About";
import Services from "../pages/public/Services";

// Authentication pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

// Therapist pages
import Dashboard from "../pages/therapist/Dashboard";
import Clients from "../pages/therapist/Clients";
import Schedule from "../pages/therapist/Schedule";
import Analytics from "../pages/therapist/Analytics";
import Notes from "../pages/therapist/Notes";
import Profile from "../pages/therapist/Profile";

// Client pages
import ClientPortal from "../pages/client/ClientPortal";

// Layouts
import PublicLayout from "../layouts/PublicLayout";
import TherapistLayout from "../layouts/TherapistLayout";
import ClientLayout from "../layouts/ClientLayout";

// Route protection
import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
        </Route>

        {/* AUTH ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* THERAPIST ROUTES */}
        <Route element={<ProtectedRoute allowedRole="therapist" />}>
          <Route path="/therapist" element={<TherapistLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="clients" element={<Clients />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="notes" element={<Notes />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>

        {/* CLIENT ROUTES */}
        <Route element={<ProtectedRoute allowedRole="client" />}>
          <Route path="/client" element={<ClientLayout />}>
            <Route path="portal" element={<ClientPortal />} />
          </Route>
        </Route>

        {/* UNKNOWN ROUTES */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
