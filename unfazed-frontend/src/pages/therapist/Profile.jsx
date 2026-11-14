import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import "./Profile.css";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [isAvailable, setIsAvailable] = useState(true);

  const [formData, setFormData] = useState({
    specialization: "",
    qualification: "",
    experience: "",
    bio: "",
    sessionDurationMinutes: 60,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch therapist profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get("/therapists/me");

      const therapist = response.data.therapist;

      setProfile(therapist);
      setIsAvailable(therapist.isAvailable ?? true);

      setFormData({
        specialization: therapist.specialization || "",
        qualification: therapist.qualification || "",
        experience: therapist.experience ?? "",
        bio: therapist.bio || "",
        sessionDurationMinutes: therapist.sessionDurationMinutes || 60,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load your profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Update therapist profile
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await axiosInstance.patch("/therapists/me", {
        ...formData,
        experience: Number(formData.experience),
        sessionDurationMinutes: Number(formData.sessionDurationMinutes),
        isAvailable,
      });

      await fetchProfile();

      setSuccess("Your profile has been updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update your profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading your profile...</div>;
  }

  if (!profile) {
    return (
      <div>
        <h2>Profile unavailable</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="therapist-profile">
      <header className="profile-header">
        <div>
          <span>THERAPIST WORKSPACE</span>
          <h1>My Profile</h1>
          <p>Manage your professional information and practice settings.</p>
        </div>
      </header>

      <section className="profile-account-card">
        <div className="profile-avatar">
          {profile.user?.name?.charAt(0).toUpperCase() || "T"}
        </div>

        <div className="profile-account-info">
          <h2>{profile.user?.name || "Therapist"}</h2>
          <p>{profile.user?.email}</p>
          <span>
            {profile.isApproved ? "Approved Therapist" : "Approval Pending"}
          </span>
        </div>
      </section>

      {error && <div className="profile-message error">{error}</div>}

      {success && <div className="profile-message success">{success}</div>}

      <form onSubmit={handleSubmit} className="profile-form">
        <section className="profile-section">
          <h2>Professional Information</h2>
          <p>Keep your professional details up to date.</p>

          <div className="profile-field">
            <label>Specialization</label>
            <input
              type="text"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              required
            />
          </div>

          <div className="profile-field">
            <label>Qualification</label>
            <input
              type="text"
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
              required
            />
          </div>

          <div className="profile-field">
            <label>Years of Experience</label>
            <input
              type="number"
              name="experience"
              min="0"
              value={formData.experience}
              onChange={handleChange}
              required
            />
          </div>

          <div className="profile-field">
            <label>Professional Bio</label>
            <textarea
              name="bio"
              rows="5"
              maxLength="1000"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell clients about your professional experience..."
            />
            <small>{formData.bio.length}/1000 characters</small>
          </div>
        </section>

        <section className="profile-section">
          <h2>Practice Settings</h2>
          <p>Configure your standard appointment duration.</p>

          <div className="profile-field">
            <label>Session Duration</label>

            <select
              name="sessionDurationMinutes"
              value={formData.sessionDurationMinutes}
              onChange={handleChange}
            >
              <option value={30}>30 Minutes</option>
              <option value={45}>45 Minutes</option>
              <option value={60}>60 Minutes</option>
              <option value={75}>75 Minutes</option>
              <option value={90}>90 Minutes</option>
            </select>
          </div>
        </section>


        <section className="profile-section">
          <h2>Availability Settings</h2>
          <p>Control whether clients can book appointments with you.</p>

          <div className="profile-field">
            <label>
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
              />
              Accepting New Appointments
            </label>

            <small>
              {isAvailable
                ? "You are currently available for appointments."
                : "You are currently unavailable for appointments."}
            </small>
          </div>
        </section>


        <button type="submit" className="profile-save-button" disabled={saving}>
          {saving ? "Saving Changes..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default Profile;
