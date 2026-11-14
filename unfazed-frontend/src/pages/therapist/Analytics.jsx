import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import "./Analytics.css";

const Analytics = () => {
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateRange, setDateRange] = useState("6months");

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        setError("");

        const [appointmentsResponse, clientsResponse] = await Promise.all([
          axiosInstance.get("/appointments"),
          axiosInstance.get("/clients?limit=50"),
        ]);

        setAppointments(appointmentsResponse.data.appointments || []);

        setClients(clientsResponse.data.clients || []);
      } catch (error) {
        setError(
          error.response?.data?.message || "Failed to load analytics data.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  // Practice Statistics
  const totalClients = clients.length;

  const totalAppointments = appointments.length;

  const scheduledAppointments = appointments.filter(
    (appointment) => appointment.status === "scheduled",
  );

  const completedAppointments = appointments.filter(
    (appointment) => appointment.status === "completed",
  );

  const cancelledAppointments = appointments.filter(
    (appointment) => appointment.status === "cancelled",
  );

  // Completion Rate
  const completionRate =
    totalAppointments > 0
      ? Math.round((completedAppointments.length / totalAppointments) * 100)
      : 0;

  // Appointment Status Percentages
  const scheduledPercentage =
    totalAppointments > 0
      ? Math.round((scheduledAppointments.length / totalAppointments) * 100)
      : 0;

  const completedPercentage =
    totalAppointments > 0
      ? Math.round((completedAppointments.length / totalAppointments) * 100)
      : 0;

  const cancelledPercentage =
    totalAppointments > 0
      ? Math.round((cancelledAppointments.length / totalAppointments) * 100)
      : 0;

  // Monthly Appointment Trends
  const monthlyAppointments = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));

    const month = date.getMonth();
    const year = date.getFullYear();

    const count = appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.date);

      return (
        appointmentDate.getMonth() === month &&
        appointmentDate.getFullYear() === year
      );
    }).length;

    return {
      month: date.toLocaleString("default", { month: "short" }),
      count,
    };
  });

  // Monthly Analytics Summary
  const totalMonthlyAppointments = monthlyAppointments.reduce(
    (total, month) => total + month.count,
    0,
  );

  const busiestMonth = monthlyAppointments.reduce(
    (busiest, month) => (month.count > busiest.count ? month : busiest),
    { month: "N/A", count: 0 },
  );

  
  // Convert appointment dates safely
  const getAppointmentDate = (value) => {
    if (!value) return null;

    // Handle date-only strings in local time
    if (
      typeof value === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
      const [year, month, day] = value.split("-").map(Number);

      return new Date(year, month - 1, day);
    }

    const parsedDate = new Date(value);

    return Number.isNaN(parsedDate.getTime())
      ? null
      : parsedDate;
  };

  // Filter Appointments by Selected Date Range
  const today = new Date();

  const rangeStart = new Date(today);
  rangeStart.setHours(0, 0, 0, 0);

  const rangeEnd = new Date(today);
  rangeEnd.setHours(23, 59, 59, 999);

  if (dateRange === "7days") {
    rangeStart.setDate(rangeStart.getDate() - 6);
  } else if (dateRange === "30days") {
    rangeStart.setDate(rangeStart.getDate() - 29);
  } else {
    rangeStart.setMonth(rangeStart.getMonth() - 5);
    rangeStart.setDate(1);
  }

  const filteredAppointments = appointments.filter((appointment) => {
    const appointmentDate = getAppointmentDate(appointment.date);

    return (
      appointmentDate &&
      appointmentDate >= rangeStart &&
      appointmentDate <= rangeEnd
    );
  });

  

  // Recent Appointments
  const recentAppointments = [...appointments]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="therapist-analytics">
      <header className="analytics-header">
        <div>
          <span>THERAPIST WORKSPACE</span>
          <h1>Analytics</h1>
          <p>Track your practice performance and appointment activity.</p>
        </div>
      </header>

      <section className="analytics-overview">
        {error && <div className="analytics-error">{error}</div>}
        {loading && (
          <p className="analytics-loading">
            Loading your practice analytics...
          </p>
        )}
        <h2>Practice Overview</h2>

        {loading ? (
          <p>Loading analytics...</p>
        ) : error ? (
          <p className="analytics-error">{error}</p>
        ) : (
          <div className="analytics-stats">
            <div className="analytics-stat-card">
              <span>Total Clients</span>
              <h3>{totalClients}</h3>
              <p>Clients in your workspace</p>
            </div>

            <div className="analytics-stat-card">
              <span>Total Appointments</span>
              <h3>{totalAppointments}</h3>
              <p>All appointment records</p>
            </div>

            <div className="analytics-stat-card">
              <span>Scheduled Sessions</span>
              <h3>{scheduledAppointments.length}</h3>
              <p>Sessions awaiting completion</p>
            </div>

            <div className="analytics-stat-card">
              <span>Completed Sessions</span>
              <h3>{completedAppointments.length}</h3>
              <p>Successfully completed</p>
            </div>

            <div className="analytics-stat-card">
              <span>Cancelled Sessions</span>
              <h3>{cancelledAppointments.length}</h3>
              <p>Cancelled appointment records</p>
            </div>

            <div className="analytics-stat-card">
              <span>Completion Rate</span>
              <h3>{completionRate}%</h3>
              <p>Completed out of all appointments</p>
            </div>
          </div>
        )}
      </section>
      {!loading && !error && (
        <>
          <section className="analytics-breakdown">
            <h2>Appointment Status Breakdown</h2>
            <p>Understand how your appointments are distributed.</p>

            <div className="analytics-progress-list">
              <div className="analytics-progress-item">
                <div className="analytics-progress-info">
                  <span>Scheduled</span>
                  <strong>{scheduledPercentage}%</strong>
                </div>

                <div className="analytics-progress-track">
                  <div
                    className="analytics-progress-fill scheduled-fill"
                    style={{ width: `${scheduledPercentage}%` }}
                  />
                </div>
              </div>

              <div className="analytics-progress-item">
                <div className="analytics-progress-info">
                  <span>Completed</span>
                  <strong>{completedPercentage}%</strong>
                </div>

                <div className="analytics-progress-track">
                  <div
                    className="analytics-progress-fill completed-fill"
                    style={{ width: `${completedPercentage}%` }}
                  />
                </div>
              </div>

              <div className="analytics-progress-item">
                <div className="analytics-progress-info">
                  <span>Cancelled</span>
                  <strong>{cancelledPercentage}%</strong>
                </div>

                <div className="analytics-progress-track">
                  <div
                    className="analytics-progress-fill cancelled-fill"
                    style={{ width: `${cancelledPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </section>
          <section className="analytics-trends">
            <h2>Monthly Appointment Trends</h2>
            <div className="analytics-filter">
              <label htmlFor="analytics-date-range">Time Period</label>
              <select
                id="analytics-date-range"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="6months">Last 6 Months</option>
              </select>
            </div>
            <p>Track your appointment activity over the last six months.</p>

            <div className="analytics-chart">
              {(dateRange === "6months"
                ? monthlyAppointments
                : [
                    {
                      month: dateRange === "7days" ? "7 Days" : "30 Days",
                      count: filteredAppointments.length,
                    },
                  ]
              ).map((item) => {
                const chartData =
                  dateRange === "6months"
                    ? monthlyAppointments
                    : [
                        {
                          month: dateRange === "7days" ? "7 Days" : "30 Days",
                          count: filteredAppointments.length,
                        },
                      ];

                const maxCount = Math.max(
                  ...chartData.map((month) => month.count),
                  1,
                );

                return (
                  <div className="analytics-chart-column" key={item.month}>
                    <span className="analytics-chart-count">{item.count}</span>

                    <div className="analytics-chart-bar-container">
                      <div
                        className="analytics-chart-bar"
                        style={{
                          height: `${Math.max(
                            (item.count / maxCount) * 100,
                            item.count > 0 ? 5 : 0,
                          )}%`,
                        }}
                      />
                    </div>

                    <span className="analytics-chart-month">{item.month}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="analytics-monthly-summary">
            <div className="analytics-summary-card">
              <span>Total Appointments (6 Months)</span>
              <h3>{totalMonthlyAppointments}</h3>
              <p>Appointments recorded during this period</p>
            </div>

            <div className="analytics-summary-card">
              <span>Busiest Month</span>
              <h3>{busiestMonth.month}</h3>
              <p>{busiestMonth.count} appointments recorded</p>
            </div>
          </section>
          <section className="analytics-recent">
            <h2>Recent Appointments</h2>
            <p>Your latest appointment activity.</p>

            {recentAppointments.length === 0 ? (
              <div className="analytics-empty">No appointments found.</div>
            ) : (
              <div className="analytics-recent-list">
                {recentAppointments.map((appointment) => (
                  <div className="analytics-recent-item" key={appointment._id}>
                    <div className="analytics-recent-info">
                      <strong>
                        {appointment.client?.user?.name || "Unknown Client"}
                      </strong>

                      <span>
                        {new Date(appointment.date).toLocaleDateString()}
                      </span>
                    </div>

                    <span className={`analytics-status ${appointment.status}`}>
                      {appointment.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default Analytics;
