
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";

import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";

import "./Login.css";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login: saveLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await axiosInstance.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = response.data;

      // Save the JWT token and user information
      saveLogin(token, user);

      // Redirect according to the user's role
      if (user.role === "therapist") {
        navigate("/therapist/dashboard", { replace: true });
      } else if (user.role === "client") {
        navigate("/client/portal", { replace: true });
      } else {
        setError("Your account has an invalid user role.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Login failed. Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">

        {/* LEFT SECTION */}
        <div className="login-visual">
          <div className="login-brand">
            Unfazed<span>.</span>
          </div>

          <div className="login-visual-content">
            <span className="login-eyebrow">
              A SPACE FOR YOUR WELLBEING
            </span>

            <h1>
              A little space.
              <br />
              A little support.
              <br />
              <span>A fresh start.</span>
            </h1>

            <p>
              Your journey matters. Connect with the right support
              and take things one step at a time.
            </p>
          </div>

          <div className="login-visual-footer">
            Thoughtful support. Your pace. Your journey.
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="login-form-section">
          <div className="login-form-wrapper">

            <div className="login-mobile-brand">
              Unfazed<span>.</span>
            </div>

            <span className="login-welcome">WELCOME BACK</span>

            <h2>Sign in to Unfazed</h2>

            <p className="login-description">
              Welcome back! Enter your details to continue.
            </p>

            <form className="login-form" onSubmit={handleSubmit}>

              <div className="login-field">
                <label htmlFor="email">Email address</label>

                <div className="login-input-wrapper">
                  <Mail size={19} />

                  <input
                    type="email"
                    id="email"
                    placeholder="Enter your email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="login-field">
                <label htmlFor="password">Password</label>

                <div className="login-input-wrapper">
                  <LockKeyhole size={19} />

                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword((previous) => !previous)
                    }
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              <div className="login-options">
                <label className="remember-option">
                  <input type="checkbox" />
                  Remember me
                </label>

                <Link to="/forgot-password">
                  Forgot password?
                </Link>
              </div>

              {error && (
                <p
                  className="login-error"
                  role="alert"
                  style={{ color: "#dc2626", fontSize: "14px" }}
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="login-submit"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>

            </form>

            <p className="login-register-text">
              Don't have an account?{" "}
              <Link to="/register">Create an account</Link>
            </p>

            <p className="login-security-note">
              Your privacy and security matter to us.
            </p>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
