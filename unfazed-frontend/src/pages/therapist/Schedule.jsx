import "./Schedule.css";
import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";

const Schedule = () => {
  const [weeklySchedule, setWeeklySchedule] = useState([]);

  // Appointment states
  const [appointments, setAppointments] = useState([]);
  const [appointmentFilter, setAppointmentFilter] = useState("all");
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState("");

  // Client states
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [clientsError, setClientsError] = useState("");

  // Create appointment form states
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [creatingAppointment, setCreatingAppointment] = useState(false);

  // Reschedule appointment states
  const [editingAppointmentId, setEditingAppointmentId] = useState(null);
  const [updatingAppointment, setUpdatingAppointment] = useState(false);
  const [cancellingAppointmentId, setCancellingAppointmentId] =
  useState(null);

  const [editAppointmentForm, setEditAppointmentForm] = useState({
    date: "",
    startTime: "09:00",
    endTime: "09:30",
    type: "online",
    notes: "",
  });

  const [appointmentForm, setAppointmentForm] = useState({
    clientId: "",
    date: "",
    startTime: "09:00",
    endTime: "09:30",
    type: "online",
    notes: "",
  });

  const filteredAppointments = appointments.filter((appointment) => {
  if (appointmentFilter === "all") {
    return true;
  }

  return appointment.status === appointmentFilter;
});

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [newStartTime, setNewStartTime] = useState("09:00");
  const [newEndTime, setNewEndTime] = useState("10:00");
  const [selectedDay, setSelectedDay] = useState("Monday");

  // Add availability slot
  const handleAddSlot = () => {
    const startMinutes =
      Number(newStartTime.split(":")[0]) * 60 +
      Number(newStartTime.split(":")[1]);

    const endMinutes =
      Number(newEndTime.split(":")[0]) * 60 +
      Number(newEndTime.split(":")[1]);

    if (endMinutes <= startMinutes) {
      alert("End time must be after start time");
      return;
    }

    const existingDay = weeklySchedule.find(
      (day) => day.day === selectedDay
    );

    const existingSlots = existingDay ? existingDay.slots : [];

    const hasOverlap = existingSlots.some((slot) => {
      const [startHour, startMinute] = slot.startTime.split(":").map(Number);
      const [endHour, endMinute] = slot.endTime.split(":").map(Number);

      const existingStart = startHour * 60 + startMinute;
      const existingEnd = endHour * 60 + endMinute;

      return startMinutes < existingEnd && endMinutes > existingStart;
    });

    if (hasOverlap) {
      alert("This time slot overlaps with an existing slot");
      return;
    }

    const newSlot = {
      startTime: newStartTime,
      endTime: newEndTime,
    };

    if (existingDay) {
      setWeeklySchedule((previousSchedule) =>
        previousSchedule.map((day) =>
          day.day === selectedDay
            ? {
                ...day,
                slots: [...day.slots, newSlot],
              }
            : day
        )
      );
    } else {
      setWeeklySchedule((previousSchedule) => [
        ...previousSchedule,
        {
          day: selectedDay,
          slots: [newSlot],
        },
      ]);
    }

    alert("Time slot added successfully");
  };

  // Create appointment
  const handleCreateAppointment = async (e) => {
    e.preventDefault();

    if (!appointmentForm.clientId) {
      alert("Please select a client.");
      return;
    }

    if (!appointmentForm.date) {
      alert("Please select an appointment date.");
      return;
    }

    if (appointmentForm.endTime <= appointmentForm.startTime) {
      alert("End time must be after start time.");
      return;
    }

    try {
      setCreatingAppointment(true);

      await axiosInstance.post("/appointments", {
        clientId: appointmentForm.clientId,
        date: appointmentForm.date,
        startTime: appointmentForm.startTime,
        endTime: appointmentForm.endTime,
        type: appointmentForm.type,
        notes: appointmentForm.notes,
      });

      const appointmentsResponse =
        await axiosInstance.get("/appointments");

      setAppointments(
        appointmentsResponse.data.appointments || []
      );

      setAppointmentForm({
        clientId: "",
        date: "",
        startTime: "09:00",
        endTime: "09:30",
        type: "online",
        notes: "",
      });

      setShowAppointmentForm(false);

      alert("Appointment created successfully!");
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to create appointment."
      );
    } finally {
      setCreatingAppointment(false);
    }
  };

  // Reschedule appointment
  const handleRescheduleAppointment = async (e) => {
    e.preventDefault();

    if (!editAppointmentForm.date) {
      alert("Please select an appointment date.");
      return;
    }

    if (editAppointmentForm.endTime <= editAppointmentForm.startTime) {
      alert("End time must be after start time.");
      return;
    }

    try {
      setUpdatingAppointment(true);

      await axiosInstance.patch(
        `/appointments/${editingAppointmentId}`,
        {
          date: editAppointmentForm.date,
          startTime: editAppointmentForm.startTime,
          endTime: editAppointmentForm.endTime,
          type: editAppointmentForm.type,
          notes: editAppointmentForm.notes,
        }
      );

      const response = await axiosInstance.get("/appointments");

      setAppointments(response.data.appointments || []);

      setEditingAppointmentId(null);

      alert("Appointment rescheduled successfully!");
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to reschedule appointment."
      );
    } finally {
      setUpdatingAppointment(false);
    }
  };

  // Cancel appointment
const handleCancelAppointment = async (appointmentId) => {
  const confirmCancel = window.confirm(
    "Are you sure you want to cancel this appointment?"
  );

  if (!confirmCancel) return;

  try {
    setCancellingAppointmentId(appointmentId);

    await axiosInstance.patch(
      `/appointments/${appointmentId}/cancel`
    );

    const response = await axiosInstance.get("/appointments");

    setAppointments(response.data.appointments || []);

    // Close the reschedule form if it belongs to this appointment
    if (editingAppointmentId === appointmentId) {
      setEditingAppointmentId(null);
    }

    alert("Appointment cancelled successfully!");
  } catch (error) {
    alert(
      error.response?.data?.message ||
        "Failed to cancel appointment."
    );
  } finally {
    setCancellingAppointmentId(null);
  }
};

  // Save weekly availability
  const handleSaveSchedule = async () => {
    try {
      setSaving(true);
      setSaveMessage("");

      const response = await axiosInstance.put(
        "/therapists/availability",
        {
          weeklySchedule,
          timezone: "Asia/Kolkata",
          isActive: true,
        }
      );

      setWeeklySchedule(response.data.availability.weeklySchedule);
      setSaveMessage("Schedule saved successfully!");
    } catch (error) {
      setSaveMessage(
        error.response?.data?.message ||
          "Failed to save schedule. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // Toggle appointment availability
  const handleToggleAvailability = async () => {
    try {
      setSaving(true);
      setSaveMessage("");

      const response = await axiosInstance.put(
        "/therapists/availability",
        {
          weeklySchedule,
          timezone: "Asia/Kolkata",
          isActive: !isActive,
        }
      );

      setWeeklySchedule(response.data.availability.weeklySchedule);
      setIsActive(response.data.availability.isActive);

      setSaveMessage(
        response.data.availability.isActive
          ? "You are now accepting appointments."
          : "You are no longer accepting appointments."
      );
    } catch (error) {
      setSaveMessage(
        error.response?.data?.message ||
          "Failed to update availability status."
      );
    } finally {
      setSaving(false);
    }
  };

  // Fetch weekly availability
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const response = await axiosInstance.get(
          "/therapists/availability"
        );

        setWeeklySchedule(response.data.availability.weeklySchedule);
        setIsActive(response.data.availability.isActive);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Failed to load availability"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, []);

  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axiosInstance.get("/appointments");

        setAppointments(response.data.appointments || []);
      } catch (error) {
        setAppointmentsError(
          error.response?.data?.message ||
            "Failed to load appointments."
        );
      } finally {
        setAppointmentsLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Fetch active clients
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axiosInstance.get(
          "/clients?status=active&limit=50"
        );

        setClients(response.data.clients || []);
      } catch (error) {
        setClientsError(
          error.response?.data?.message ||
            "Failed to load active clients."
        );
      } finally {
        setClientsLoading(false);
      }
    };

    fetchClients();
  }, []);

  if (loading) {
    return <p>Loading your schedule...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="schedule-page">
      <div className="schedule-header">
        <h1>My Schedule</h1>
        <p>Manage your weekly availability.</p>
      </div>

      <div className="availability-status">
        <div>
          <h2>Appointment Availability</h2>
          <p>
            {isActive
              ? "You are currently accepting appointments."
              : "You are currently not accepting appointments."}
          </p>
        </div>

        <button
          type="button"
          className={`availability-toggle ${
            isActive ? "active" : "inactive"
          }`}
          onClick={handleToggleAvailability}
          disabled={saving}
        >
          {saving ? "Updating..." : isActive ? "Turn OFF" : "Turn ON"}
        </button>
      </div>

      <div className="schedule-form">
        <h2>Add Availability</h2>

        <div className="schedule-form-fields">
          <div className="schedule-field">
            <label>Select Day</label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
            >
              {daysOfWeek.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          <div className="schedule-field">
            <label>Start Time</label>
            <input
              type="time"
              value={newStartTime}
              onChange={(e) => setNewStartTime(e.target.value)}
            />
          </div>

          <div className="schedule-field">
            <label>End Time</label>
            <input
              type="time"
              value={newEndTime}
              onChange={(e) => setNewEndTime(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="add-slot-btn"
            onClick={handleAddSlot}
          >
            + Add Time Slot
          </button>
        </div>
      </div>

      <div className="weekly-schedule">
        <h2>Weekly Availability</h2>

        <button
          type="button"
          className="add-slot-btn"
          onClick={handleSaveSchedule}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Schedule"}
        </button>

        {saveMessage && <p>{saveMessage}</p>}

        <div className="schedule-days">
          {daysOfWeek.map((dayName) => {
            const daySchedule = weeklySchedule.find(
              (day) => day.day === dayName
            );

            return (
              <div className="schedule-day-card" key={dayName}>
                <h3>{dayName}</h3>

                {daySchedule && daySchedule.slots.length > 0 ? (
                  daySchedule.slots.map((slot, index) => (
                    <div className="schedule-slot" key={index}>
                      <span>
                        {slot.startTime} - {slot.endTime}
                      </span>

                      <button
                        type="button"
                        className="remove-slot-btn"
                        onClick={() => {
                          setWeeklySchedule((previousSchedule) =>
                            previousSchedule.map((day) =>
                              day.day === dayName
                                ? {
                                    ...day,
                                    slots: day.slots.filter(
                                      (_, slotIndex) =>
                                        slotIndex !== index
                                    ),
                                  }
                                : day
                            )
                          );
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="unavailable-text">Not available</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Appointments Section */}
      <div className="appointments-section">
        <div className="appointments-header">
          <h2>Appointments</h2>

          <button
            type="button"
            className="create-appointment-btn"
            onClick={() =>
              setShowAppointmentForm(!showAppointmentForm)
            }
          >
            + Create Appointment
          </button>
        </div>

        {/* Create Appointment Form */}
        {showAppointmentForm && (
          <form
            className="appointment-form"
            onSubmit={handleCreateAppointment}
          >
            <h3>Create New Appointment</h3>

            <div className="appointment-form-group">
              <label htmlFor="appointment-client">
                Select Client
              </label>

              <select
                id="appointment-client"
                value={appointmentForm.clientId}
                onChange={(e) =>
                  setAppointmentForm((prev) => ({
                    ...prev,
                    clientId: e.target.value,
                  }))
                }
                required
              >
                <option value="">Choose a client</option>

                {clients
                  .filter(
                    (client) =>
                      client.relationshipStatus === "active"
                  )
                  .map((client) => (
                    <option
                      key={client.clientId}
                      value={client.clientId}
                    >
                      {client.name} ({client.email})
                    </option>
                  ))}
              </select>

              {clientsLoading && <p>Loading clients...</p>}

              {!clientsLoading &&
                !clientsError &&
                clients.filter(
                  (client) =>
                    client.relationshipStatus === "active"
                ).length === 0 && (
                  <p>No active clients available.</p>
                )}

              {clientsError && <p>{clientsError}</p>}
            </div>

            <div className="appointment-form-group">
              <label htmlFor="appointment-date">
                Appointment Date
              </label>

              <input
                id="appointment-date"
                type="date"
                value={appointmentForm.date}
                onChange={(e) =>
                  setAppointmentForm((prev) => ({
                    ...prev,
                    date: e.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="appointment-form-row">
              <div className="appointment-form-group">
                <label htmlFor="appointment-start">
                  Start Time
                </label>

                <input
                  id="appointment-start"
                  type="time"
                  value={appointmentForm.startTime}
                  onChange={(e) =>
                    setAppointmentForm((prev) => ({
                      ...prev,
                      startTime: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="appointment-form-group">
                <label htmlFor="appointment-end">
                  End Time
                </label>

                <input
                  id="appointment-end"
                  type="time"
                  value={appointmentForm.endTime}
                  onChange={(e) =>
                    setAppointmentForm((prev) => ({
                      ...prev,
                      endTime: e.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>

            <div className="appointment-form-group">
              <label htmlFor="appointment-type">
                Appointment Type
              </label>

              <select
                id="appointment-type"
                value={appointmentForm.type}
                onChange={(e) =>
                  setAppointmentForm((prev) => ({
                    ...prev,
                    type: e.target.value,
                  }))
                }
              >
                <option value="online">Online</option>
                <option value="in-person">In Person</option>
              </select>
            </div>

            <div className="appointment-form-group">
              <label htmlFor="appointment-notes">
                Session Notes
              </label>

              <textarea
                id="appointment-notes"
                value={appointmentForm.notes}
                onChange={(e) =>
                  setAppointmentForm((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                placeholder="Enter appointment notes..."
                rows="3"
              />
            </div>

            <div className="appointment-form-actions">
              <button
                type="button"
                onClick={() => setShowAppointmentForm(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={creatingAppointment}
              >
                {creatingAppointment
                  ? "Creating..."
                  : "Create Appointment"}
              </button>
            </div>
          </form>
        )}

        {/* Appointment Filters */}
<div className="appointment-filters">
  {[
    { label: "All", value: "all" },
    { label: "Scheduled", value: "scheduled" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
  ].map((filter) => (
    <button
      key={filter.value}
      type="button"
      className={`appointment-filter-btn ${
        appointmentFilter === filter.value ? "active" : ""
      }`}
      onClick={() => setAppointmentFilter(filter.value)}
    >
      {filter.label}
    </button>
  ))}
</div>

        {/* Appointments List */}
        {appointmentsLoading ? (
          <p>Loading appointments...</p>
        ) : appointmentsError ? (
          <p className="appointments-error">
            {appointmentsError}
          </p>
       ) : filteredAppointments.length === 0 ? (
          <p className="no-appointments">
            No appointments yet.
          </p>
        ) : (
          <div className="appointments-list">
           {filteredAppointments.map((appointment) => (
              <div
                className="appointment-card"
                key={appointment._id}
              >
                <div className="appointment-card-header">
                  <div>
                    <h3>
                      {appointment.client?.user?.name ||
                        "Unknown Client"}
                    </h3>

                    <p>
                      {appointment.client?.user?.email || ""}
                    </p>
                  </div>

                  <span
                    className={`appointment-status ${appointment.status}`}
                  >
                    {appointment.status}
                  </span>

                {appointment.status === "scheduled" && (
  <div className="appointment-actions">
    <button
      type="button"
      className="reschedule-appointment-btn"
      onClick={() => {
        setEditingAppointmentId(appointment._id);

        setEditAppointmentForm({
          date: new Date(appointment.date)
            .toISOString()
            .split("T")[0],
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          type: appointment.type,
          notes: appointment.notes || "",
        });
      }}
    >
      Reschedule
    </button>

    <button
      type="button"
      className="cancel-appointment-btn"
      onClick={() => handleCancelAppointment(appointment._id)}
      disabled={cancellingAppointmentId === appointment._id}
    >
      {cancellingAppointmentId === appointment._id
        ? "Cancelling..."
        : "Cancel Appointment"}
    </button>
  </div>
)}
                 
                </div>

                <div className="appointment-details">
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(
                      appointment.date
                    ).toLocaleDateString("en-IN", {
                      timeZone: "UTC",
                    })}
                  </p>

                  <p>
                    <strong>Time:</strong>{" "}
                    {appointment.startTime} - {appointment.endTime}
                  </p>

                  <p>
                    <strong>Type:</strong>{" "}
                    {appointment.type === "online"
                      ? "Online"
                      : "In-person"}
                  </p>

                  {appointment.notes && (
                    <p>
                      <strong>Notes:</strong>{" "}
                      {appointment.notes}
                    </p>
                  )}
                </div>

                {/* Reschedule Form */}
                {editingAppointmentId === appointment._id && (
                  <form
                    className="reschedule-form"
                    onSubmit={handleRescheduleAppointment}
                  >
                    <h4>Reschedule Appointment</h4>

                    <div className="appointment-form-group">
                      <label htmlFor={`edit-date-${appointment._id}`}>
                        Appointment Date
                      </label>

                      <input
                        id={`edit-date-${appointment._id}`}
                        type="date"
                        value={editAppointmentForm.date}
                        onChange={(e) =>
                          setEditAppointmentForm((prev) => ({
                            ...prev,
                            date: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>

                    <div className="appointment-form-row">
                      <div className="appointment-form-group">
                        <label htmlFor={`edit-start-${appointment._id}`}>
                          Start Time
                        </label>

                        <input
                          id={`edit-start-${appointment._id}`}
                          type="time"
                          value={editAppointmentForm.startTime}
                          onChange={(e) =>
                            setEditAppointmentForm((prev) => ({
                              ...prev,
                              startTime: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>

                      <div className="appointment-form-group">
                        <label htmlFor={`edit-end-${appointment._id}`}>
                          End Time
                        </label>

                        <input
                          id={`edit-end-${appointment._id}`}
                          type="time"
                          value={editAppointmentForm.endTime}
                          onChange={(e) =>
                            setEditAppointmentForm((prev) => ({
                              ...prev,
                              endTime: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="appointment-form-group">
                      <label htmlFor={`edit-type-${appointment._id}`}>
                        Appointment Type
                      </label>

                      <select
                        id={`edit-type-${appointment._id}`}
                        value={editAppointmentForm.type}
                        onChange={(e) =>
                          setEditAppointmentForm((prev) => ({
                            ...prev,
                            type: e.target.value,
                          }))
                        }
                      >
                        <option value="online">Online</option>
                        <option value="in-person">In Person</option>
                      </select>
                    </div>

                    <div className="appointment-form-group">
                      <label htmlFor={`edit-notes-${appointment._id}`}>
                        Session Notes
                      </label>

                      <textarea
                        id={`edit-notes-${appointment._id}`}
                        value={editAppointmentForm.notes}
                        onChange={(e) =>
                          setEditAppointmentForm((prev) => ({
                            ...prev,
                            notes: e.target.value,
                          }))
                        }
                        rows="3"
                      />
                    </div>

                    <div className="appointment-form-actions">
                      <button
                        type="button"
                        onClick={() =>
                          setEditingAppointmentId(null)
                        }
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={updatingAppointment}
                      >
                        {updatingAppointment
                          ? "Saving..."
                          : "Save Changes"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Schedule;
