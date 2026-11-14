import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRole }) => {
  const { user, token, loading } = useAuth();

  // Wait until backend authentication verification finishes
  if (loading) {
    return <div>Verifying your session...</div>;
  }

  // Redirect if the user is not authenticated
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check whether the user has the correct role
  if (allowedRole && user.role !== allowedRole) {
    if (user.role === "therapist") {
      return <Navigate to="/therapist/dashboard" replace />;
    }

    if (user.role === "client") {
      return <Navigate to="/client/portal" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
