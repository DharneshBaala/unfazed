import { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Search,
  Mail,
  Phone,
  CalendarDays,
  X,
  LoaderCircle,
} from "lucide-react";

import axiosInstance from "../../api/axiosInstance";
import "./Clients.css";

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [email, setEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientDetailsLoading, setClientDetailsLoading] = useState(false);
  const [clientDetailsError, setClientDetailsError] = useState("");
  const [isEditingClient, setIsEditingClient] = useState(false);
  const [editClientPhone, setEditClientPhone] = useState("");
  const [editClientDateOfBirth, setEditClientDateOfBirth] = useState("");
  const [savingClient, setSavingClient] = useState(false);
  const [clientUpdateMessage, setClientUpdateMessage] = useState("");

  // Fetch therapist's clients
  const fetchClients = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get("/clients?limit=50");

      setClients(response.data.clients || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load clients. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Update client details
  const handleSaveClientDetails = async () => {
    try {
      setSavingClient(true);
      setClientUpdateMessage("");

      const clientId = selectedClient._id || selectedClient.clientId;

      await axiosInstance.patch(`/clients/${clientId}`, {
        phone: editClientPhone,
        dateOfBirth: editClientDateOfBirth || null,
      });

      setSelectedClient((previousClient) => ({
        ...previousClient,
        phone: editClientPhone,
        dateOfBirth: editClientDateOfBirth || null,
      }));

      setIsEditingClient(false);
      setClientUpdateMessage("Client details updated successfully.");
    } catch (error) {
      setClientUpdateMessage(
        error.response?.data?.message || "Unable to update client details.",
      );
    } finally {
      setSavingClient(false);
    }
  };

  // Update client relationship status
  const handleClientStatusChange = async (newStatus) => {
    try {
      const clientId = selectedClient._id || selectedClient.clientId;

      await axiosInstance.patch(`/clients/${clientId}/relationship-status`, {
        status: newStatus,
      });

      setSelectedClient((previousClient) => ({
        ...previousClient,
        relationshipStatus: newStatus,
      }));

      await fetchClients();
    } catch (error) {
      setClientDetailsError(
        error.response?.data?.message || "Unable to update client status.",
      );
    }
  };

  // Fetch individual client details
  const fetchClientDetails = async (clientId) => {
    try {
      setClientDetailsLoading(true);
      setClientDetailsError("");
      setSelectedClient(null);

      const response = await axiosInstance.get(`/clients/${clientId}`);

      setSelectedClient(response.data.client);
    } catch (error) {
      setClientDetailsError(
        error.response?.data?.message || "Unable to load client details.",
      );
    } finally {
      setClientDetailsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Send client invitation
  const handleInvite = async (e) => {
    e.preventDefault();

    try {
      setInviting(true);
      setError("");
      setSuccessMessage("");

      const response = await axiosInstance.post("/clients/invite", {
        email: email.trim().toLowerCase(),
      });

      setSuccessMessage(response.data.message);
      setEmail("");
      setShowInviteModal(false);

      fetchClients();
    } catch (error) {
      setError(error.response?.data?.message || "Unable to send invitation.");
    } finally {
      setInviting(false);
    }
  };

  // Search clients
  const filteredClients = clients.filter((client) => {
    const searchValue = search.toLowerCase();

    return (
      client.name?.toLowerCase().includes(searchValue) ||
      client.email?.toLowerCase().includes(searchValue)
    );
  });

  const activeClients = clients.filter(
    (client) => client.relationshipStatus === "active",
  );

  const inactiveClients = clients.filter(
    (client) => client.relationshipStatus === "inactive",
  );

  return (
    <div className="clients-page">
      <div className="clients-header">
        <div>
          <span className="clients-eyebrow">CLIENT MANAGEMENT</span>
          <h1>My Clients</h1>
          <p>Manage your client relationships and stay connected.</p>
        </div>

        <button
          className="clients-invite-btn"
          onClick={() => setShowInviteModal(true)}
        >
          <UserPlus size={18} />
          Invite Client
        </button>
      </div>

      {successMessage && (
        <div className="clients-success">
          {successMessage}
          <button onClick={() => setSuccessMessage("")}>
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <div className="clients-error">
          {error}
          <button onClick={() => setError("")}>
            <X size={16} />
          </button>
        </div>
      )}

      <div className="clients-stats">
        <div className="clients-stat-card">
          <div className="clients-stat-icon">
            <Users size={21} />
          </div>
          <span>Total Clients</span>
          <h2>{clients.length}</h2>
        </div>

        <div className="clients-stat-card">
          <div className="clients-stat-icon active-icon">
            <Users size={21} />
          </div>
          <span>Active Clients</span>
          <h2>{activeClients.length}</h2>
        </div>

        <div className="clients-stat-card">
          <div className="clients-stat-icon inactive-icon">
            <Users size={21} />
          </div>
          <span>Inactive Clients</span>
          <h2>{inactiveClients.length}</h2>
        </div>
      </div>

      <div className="clients-content">
        <div className="clients-content-header">
          <div>
            <h2>Client Directory</h2>
            <p>Your connected clients and their information.</p>
          </div>

          <div className="clients-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="clients-loading">
            <LoaderCircle className="clients-spinner" size={28} />
            <p>Loading clients...</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="clients-empty">
            <div className="clients-empty-icon">
              <Users size={30} />
            </div>

            <h3>{search ? "No matching clients" : "No clients yet"}</h3>

            <p>
              {search
                ? "Try searching with another name or email."
                : "Invite a registered client to start building your client directory."}
            </p>

            {!search && (
              <button
                className="clients-invite-btn"
                onClick={() => setShowInviteModal(true)}
              >
                <UserPlus size={17} />
                Invite Your First Client
              </button>
            )}
          </div>
        ) : (
          <div className="clients-table-wrapper">
            <table className="clients-table">
              <thead>
                <tr>
                  <th>CLIENT</th>
                  <th>CONTACT</th>
                  <th>CONNECTED DATE</th>
                  <th>STATUS</th>
                </tr>
              </thead>

              <tbody>
                {filteredClients.map((client) => (
                  <tr
                    key={client.relationshipId}
                    className="clients-clickable-row"
                    onClick={() => fetchClientDetails(client.clientId)}
                  >
                    <td>
                      <div className="clients-name-cell">
                        <div className="clients-avatar">
                          {client.name?.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <strong>{client.name}</strong>
                          <span>Client</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="clients-contact">
                        <span>
                          <Mail size={14} />
                          {client.email}
                        </span>

                        <span>
                          <Phone size={14} />
                          {client.phone || "Not provided"}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className="clients-date">
                        <CalendarDays size={15} />
                        {client.connectedAt
                          ? new Date(client.connectedAt).toLocaleDateString()
                          : "—"}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`clients-status ${
                          client.relationshipStatus
                        }`}
                      >
                        {client.relationshipStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showInviteModal && (
        <div
          className="clients-modal-overlay"
          onClick={() => setShowInviteModal(false)}
        >
          <div className="clients-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="clients-modal-close"
              onClick={() => setShowInviteModal(false)}
            >
              <X size={20} />
            </button>

            <div className="clients-modal-icon">
              <UserPlus size={23} />
            </div>

            <h2>Invite a Client</h2>
            <p>
              Enter the email address associated with the client's registered
              Unfazed account.
            </p>

            <form onSubmit={handleInvite}>
              <label htmlFor="client-email">Client Email Address</label>

              <input
                id="client-email"
                type="email"
                placeholder="client@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <button
                type="submit"
                className="clients-invite-btn clients-submit-btn"
                disabled={inviting}
              >
                {inviting ? "Sending..." : "Send Invitation"}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Client Details Modal */}
      {(clientDetailsLoading || selectedClient || clientDetailsError) && (
        <div
          className="clients-modal-overlay"
          onClick={() => {
            setSelectedClient(null);
            setClientDetailsError("");
          }}
        >
          <div
            className="clients-modal clients-details-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="clients-modal-close"
              onClick={() => {
                setSelectedClient(null);
                setClientDetailsError("");
              }}
            >
              <X size={20} />
            </button>

            {clientDetailsLoading ? (
              <div className="clients-loading">
                <LoaderCircle className="clients-spinner" size={28} />
                <p>Loading client details...</p>
              </div>
            ) : clientDetailsError ? (
              <div className="clients-error">{clientDetailsError}</div>
            ) : selectedClient ? (
              <>
                <div className="clients-details-header">
                  <div className="clients-avatar">
                    {selectedClient.name?.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <h2>{selectedClient.name}</h2>
                    <p>Client Profile</p>
                  </div>
                </div>

                <div className="clients-details-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setEditClientPhone(selectedClient.phone || "");
                      setEditClientDateOfBirth(
                        selectedClient.dateOfBirth
                          ? new Date(selectedClient.dateOfBirth)
                              .toISOString()
                              .split("T")[0]
                          : "",
                      );
                      setClientUpdateMessage("");
                      setIsEditingClient(true);
                    }}
                  >
                    Edit Details
                  </button>
                  <div className="clients-status-actions">
                    <span>Relationship Status</span>

                    <div className="clients-status-buttons">
                      <button
                        type="button"
                        className={
                          selectedClient.relationshipStatus === "active"
                            ? "clients-status-active selected"
                            : "clients-status-active"
                        }
                        onClick={() => handleClientStatusChange("active")}
                        disabled={
                          selectedClient.relationshipStatus === "active"
                        }
                      >
                        Active
                      </button>

                      <button
                        type="button"
                        className={
                          selectedClient.relationshipStatus === "inactive"
                            ? "clients-status-inactive selected"
                            : "clients-status-inactive"
                        }
                        onClick={() => handleClientStatusChange("inactive")}
                        disabled={
                          selectedClient.relationshipStatus === "inactive"
                        }
                      >
                        Inactive
                      </button>
                    </div>
                  </div>
                </div>

                {isEditingClient ? (
                  <div className="clients-edit-form">
                    <div className="clients-edit-field">
                      <label htmlFor="editClientPhone">Phone Number</label>
                      <input
                        id="editClientPhone"
                        type="tel"
                        value={editClientPhone}
                        onChange={(e) => setEditClientPhone(e.target.value)}
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div className="clients-edit-field">
                      <label htmlFor="editClientDateOfBirth">
                        Date of Birth
                      </label>
                      <input
                        id="editClientDateOfBirth"
                        type="date"
                        value={editClientDateOfBirth}
                        onChange={(e) =>
                          setEditClientDateOfBirth(e.target.value)
                        }
                      />
                    </div>

                    {clientUpdateMessage && (
                      <p className="clients-update-message">
                        {clientUpdateMessage}
                      </p>
                    )}

                    <div className="clients-edit-actions">
                      <button
                        type="button"
                        className="clients-cancel-btn"
                        onClick={() => {
                          setIsEditingClient(false);
                          setClientUpdateMessage("");
                        }}
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        className="clients-save-btn"
                        onClick={handleSaveClientDetails}
                        disabled={savingClient}
                      >
                        {savingClient ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="clients-details-grid">
                    <div className="clients-details-item">
                      <span>Email</span>
                      <strong>{selectedClient.email || "Not provided"}</strong>
                    </div>

                    <div className="clients-details-item">
                      <span>Phone</span>
                      <strong>{selectedClient.phone || "Not provided"}</strong>
                    </div>

                    <div className="clients-details-item">
                      <span>Date of Birth</span>
                      <strong>
                        {selectedClient.dateOfBirth
                          ? new Date(
                              selectedClient.dateOfBirth,
                            ).toLocaleDateString()
                          : "Not provided"}
                      </strong>
                    </div>

                    <div className="clients-details-item">
                      <span>Intake Form</span>
                      <strong>
                        {selectedClient.intakeCompleted
                          ? "Completed"
                          : "Not completed"}
                      </strong>
                    </div>

                    <div className="clients-details-item">
                      <span>Account Status</span>
                      <strong>
                        {selectedClient.status || "Not available"}
                      </strong>
                    </div>

                    <div className="clients-details-item">
                      <span>Connected Since</span>
                      <strong>
                        {selectedClient.connectedAt
                          ? new Date(
                              selectedClient.connectedAt,
                            ).toLocaleDateString()
                          : "Not available"}
                      </strong>
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
