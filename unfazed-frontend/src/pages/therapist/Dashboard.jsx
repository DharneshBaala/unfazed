
import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import "./Dashboard.css";

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const [appointmentsResponse, clientsResponse] =
          await Promise.all([
            axiosInstance.get("/appointments"),
            axiosInstance.get("/clients?limit=50"),
          ]);

        setAppointments(
          appointmentsResponse.data.appointments || []
        );

        setClients(
          clientsResponse.data.clients || []
        );
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Failed to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Dashboard statistics
  const totalClients = clients.length;

  const upcomingAppointments = appointments.filter(
    (appointment) =>
      appointment.status === "scheduled" &&
      new Date(appointment.date) >=
        new Date().setHours(0, 0, 0, 0)
  );

  const completedAppointments = appointments.filter(
    (appointment) => appointment.status === "completed"
  );

  const totalAppointments = appointments.length;

  // Sort upcoming appointments
  const sortedUpcomingAppointments = [
    ...upcomingAppointments,
  ]
    .sort(
      (a, b) =>
        new Date(a.date) - new Date(b.date) ||
        a.startTime.localeCompare(b.startTime)
    )
    .slice(0, 5);

  // Recent activity
  const recentAppointments = [...appointments]
    .sort(
      (a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
    )
    .slice(0, 5);

  return (
    <div className="therapist-dashboard">
      {/* Dashboard Header */}
      <header className="dashboard-header">
        <div>
          <span>THERAPIST WORKSPACE</span>
          <h1>Dashboard</h1>
          <p>Welcome to your Unfazed workspace.</p>
        </div>
      </header>

      {/* Overview Statistics */}
      <section className="dashboard-overview">
        <h2>Your Overview</h2>

        {loading ? (
          <p>Loading your dashboard...</p>
        ) : error ? (
          <p className="dashboard-error">{error}</p>
        ) : (
          <div className="dashboard-stats">
            <div className="dashboard-stat-card">
              <span>Total Clients</span>
              <h3>{totalClients}</h3>
              <p>Clients in your workspace</p>
            </div>

            <div className="dashboard-stat-card">
              <span>Total Appointments</span>
              <h3>{totalAppointments}</h3>
              <p>All appointment records</p>
            </div>

            <div className="dashboard-stat-card">
              <span>Upcoming Sessions</span>
              <h3>{upcomingAppointments.length}</h3>
              <p>Scheduled sessions today or later</p>
            </div>

            <div className="dashboard-stat-card">
              <span>Completed Sessions</span>
              <h3>{completedAppointments.length}</h3>
              <p>Successfully completed sessions</p>
            </div>
          </div>
        )}
      </section>

      {/* Upcoming Appointments */}
      <section className="dashboard-upcoming">
        <div className="dashboard-section-header">
          <h2>Upcoming Appointments</h2>
          <span>{upcomingAppointments.length} sessions</span>
        </div>

        {loading ? (
          <p>Loading appointments...</p>
        ) : error ? (
          <p className="dashboard-error">{error}</p>
        ) : sortedUpcomingAppointments.length === 0 ? (
          <p className="dashboard-empty">
            No upcoming appointments scheduled.
          </p>
        ) : (
          <div className="dashboard-appointments">
            {sortedUpcomingAppointments.map((appointment) => (
              <div
                className="dashboard-appointment-card"
                key={appointment._id}
              >
                <div>
                  <h3>
                    {appointment.client?.user?.name ||
                      "Unknown Client"}
                  </h3>

                  <p>
                    {new Date(
                      appointment.date
                    ).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      timeZone: "UTC",
                    })}
                  </p>
                </div>

                <div className="dashboard-appointment-time">
                  <span>
                    {appointment.startTime} – {appointment.endTime}
                  </span>

                  <small>{appointment.type}</small>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Activity */}
      <section className="dashboard-recent">
        <div className="dashboard-section-header">
          <h2>Recent Activity</h2>
          <span>Latest 5 records</span>
        </div>

        {loading ? (
          <p>Loading recent activity...</p>
        ) : error ? (
          <p className="dashboard-error">{error}</p>
        ) : recentAppointments.length === 0 ? (
          <p className="dashboard-empty">
            No recent activity available.
          </p>
        ) : (
          <div className="dashboard-recent-list">
            {recentAppointments.map((appointment) => (
              <div
                className="dashboard-recent-item"
                key={appointment._id}
              >
                <div>
                  <h3>
                    {appointment.client?.user?.name ||
                      "Unknown Client"}
                  </h3>

                  <p>
                    Appointment created on{" "}
                    {appointment.createdAt
                      ? new Date(
                          appointment.createdAt
                        ).toLocaleDateString("en-IN")
                      : "Date unavailable"}
                  </p>
                </div>

                <span
                  className={`dashboard-status ${appointment.status}`}
                >
                  {appointment.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
