import "./Register.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

const Register = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState("client");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    specialization: "",
    qualification: "",
    experience: "",
    bio: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const endpoint =
        role === "therapist"
          ? "/auth/register-therapist"
          : "/auth/register";

      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      };

      if (role === "therapist") {
        registrationData.specialization = formData.specialization;
        registrationData.qualification = formData.qualification;
        registrationData.experience = Number(formData.experience);
        registrationData.bio = formData.bio;
      }

      await axiosInstance.post(endpoint, registrationData);

      setSuccess(
        role === "therapist"
          ? "Therapist account created successfully. You can now sign in. Your therapist account may require approval before you can use all features."
          : "Client account created successfully. You can now sign in."
      );

      setFormData({
        name: "",
        email: "",
        password: "",
        specialization: "",
        qualification: "",
        experience: "",
        bio: "",
      });

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="register-page">
        <div className="register-container">
          <h1>Welcome to Unfazed!</h1>

          <p>{success}</p>

          <button onClick={() => navigate("/login")}>
            Continue to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      <div className="register-container">

        <div className="register-header">
          <span>UNFAZED</span>
          <h1>Create your account</h1>
          <p>
            Start your journey with thoughtful support.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">

          {/* ACCOUNT TYPE */}
          <div className="register-field">
            <label htmlFor="role">I want to register as</label>

            <select
              id="role"
              value={role}
              onChange={(event) => {
                setRole(event.target.value);
                setError("");
              }}
            >
              <option value="client">Client</option>
              <option value="therapist">Therapist</option>
            </select>
          </div>

          {/* COMMON FIELDS */}
          <div className="register-field">
            <label htmlFor="name">Full name</label>

            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
              required
            />
          </div>

          <div className="register-field">
            <label htmlFor="email">Email address</label>

            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="register-field">
            <label htmlFor="password">Password</label>

            <input
              type="password"
              id="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </div>

          {/* THERAPIST-ONLY FIELDS */}
          {role === "therapist" && (
            <>
              <div className="register-field">
                <label htmlFor="specialization">
                  Specialization
                </label>

                <input
                  type="text"
                  id="specialization"
                  name="specialization"
                  placeholder="e.g. Clinical Psychology"
                  value={formData.specialization}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="register-field">
                <label htmlFor="qualification">
                  Qualification
                </label>

                <input
                  type="text"
                  id="qualification"
                  name="qualification"
                  placeholder="e.g. M.Sc. Psychology"
                  value={formData.qualification}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="register-field">
                <label htmlFor="experience">
                  Years of experience
                </label>

                <input
                  type="number"
                  id="experience"
                  name="experience"
                  placeholder="Enter years of experience"
                  min="0"
                  value={formData.experience}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="register-field">
                <label htmlFor="bio">Professional bio</label>

                <textarea
                  id="bio"
                  name="bio"
                  placeholder="Tell us about your professional background..."
                  value={formData.bio}
                  onChange={handleChange}
                  rows="4"
                  required
                />
              </div>
            </>
          )}

          {/* ERROR MESSAGE */}
          {error && (
            <p className="register-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="register-submit"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

        </form>

        <p className="register-login-text">
          Already have an account?{" "}
          <Link to="/login">Sign in</Link>
        </p>

      </div>
    </div>
  );
};

export default Register;
