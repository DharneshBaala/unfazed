import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  FileText,
  Trash2,
  X,
  Lock,
  ClipboardList,
  Pencil,
} from "lucide-react";

import axiosInstance from "../../api/axiosInstance";
import "./Notes.css";

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [clients, setClients] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [editingNote, setEditingNote] = useState(null);

  const [formData, setFormData] = useState({
    clientId: "",
    title: "",
    content: "",
  });

  // ==========================================
  // FETCH NOTES AND CLIENTS
  // ==========================================

  const fetchNotesAndClients = async () => {
    try {
      setLoading(true);
      setError("");

      const [notesResponse, clientsResponse] = await Promise.all([
        axiosInstance.get("/session-notes"),
        axiosInstance.get("/clients?status=active&limit=50"),
      ]);

      setClients(clientsResponse.data.clients || []);

      const formattedNotes = (notesResponse.data.notes || []).map((note) => ({
        id: note._id,
        clientId: note.client?._id,
        clientName: note.client?.user?.name || "Unknown Client",
        title: note.title,
        content: note.content,
        date: new Date(note.createdAt).toLocaleDateString("en-IN"),
      }));

      setNotes(formattedNotes);
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to load notes and clients.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD DATA WHEN PAGE OPENS
  // ==========================================

  useEffect(() => {
    fetchNotesAndClients();
  }, []);

  // ==========================================
  // HANDLE FORM INPUTS
  // ==========================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ==========================================
  // CREATE SESSION NOTE
  // ==========================================

  const handleCreateNote = async (e) => {
    e.preventDefault();

    if (
      !formData.clientId ||
      !formData.title.trim() ||
      !formData.content.trim()
    ) {
      setError("Please complete all fields.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await axiosInstance.post("/session-notes", {
        clientId: formData.clientId,
        title: formData.title.trim(),
        content: formData.content.trim(),
      });

      await fetchNotesAndClients();

      setFormData({
        clientId: "",
        title: "",
        content: "",
      });

      setShowForm(false);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create note.");
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // UPDATE SESSION NOTE
  // ==========================================

  const handleUpdateNote = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      setError("Please complete all fields.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await axiosInstance.patch(`/session-notes/${editingNote.id}`, {
        title: formData.title.trim(),
        content: formData.content.trim(),
      });

      await fetchNotesAndClients();

      setEditingNote(null);
      setSelectedNote(null);
      setShowForm(false);

      setFormData({
        clientId: "",
        title: "",
        content: "",
      });
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update note.");
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // DELETE SESSION NOTE
  // ==========================================

  const handleDeleteNote = async (id) => {
    try {
      setError("");

      await axiosInstance.delete(`/session-notes/${id}`);

      setNotes((previousNotes) =>
        previousNotes.filter((note) => note.id !== id),
      );

      setSelectedNote(null);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete note.");
    }
  };

  // ==========================================
  // SEARCH NOTES
  // ==========================================

  const filteredNotes = notes.filter((note) =>
    `${note.clientName} ${note.title} ${note.content}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  // ==========================================
  // JSX
  // ==========================================

  return (
    <div className="notes-page">
      {/* Page Header */}

      <div className="notes-header">
        <div>
          <h1>Client Notes</h1>
          <p>Organize and manage your private client notes.</p>
        </div>

        <button
          className="create-note-btn"
          onClick={() => {
            setSelectedNote(null);
            setEditingNote(null);
            setFormData({
              clientId: "",
              title: "",
              content: "",
            });
            setError("");
            setShowForm(true);
          }}
        >
          <Plus size={18} />
          Create Note
        </button>
      </div>

      {/* Privacy Information */}

      <div className="notes-privacy">
        <div className="privacy-icon">
          <Lock size={20} />
        </div>

        <div>
          <h3>Private Workspace</h3>
          <p>
            Your clinical notes should remain confidential and accessible only
            to authorized users.
          </p>
        </div>
      </div>

      {/* Error Message */}

      {error && <div className="notes-error">{error}</div>}

      {/* Notes Statistics */}

      <div className="notes-stats">
        <div className="notes-stat-card">
          <div className="notes-stat-icon">
            <FileText size={21} />
          </div>

          <div>
            <p>Total Notes</p>
            <h2>{notes.length}</h2>
          </div>
        </div>

        <div className="notes-stat-card">
          <div className="notes-stat-icon">
            <ClipboardList size={21} />
          </div>

          <div>
            <p>Clients Documented</p>
            <h2>{new Set(notes.map((note) => note.clientId)).size}</h2>
          </div>
        </div>
      </div>

      {/* Search */}

      <div className="notes-toolbar">
        <div className="notes-search">
          <Search size={19} />

          <input
            type="text"
            placeholder="Search notes or clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Create Note Form */}

      {showForm && (
        <div className="note-form-card">
          <div className="note-form-header">
            <div>
              <h2>{editingNote ? "Edit Note" : "Create New Note"}</h2>
              <p>
                {editingNote
                  ? "Update your private client note."
                  : "Add a private note to your workspace."}
              </p>
            </div>

            <button
              className="close-note-btn"
              onClick={() => {
                setShowForm(false);
                setEditingNote(null);
                setFormData({
                  clientId: "",
                  title: "",
                  content: "",
                });
              }}
              type="button"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={editingNote ? handleUpdateNote : handleCreateNote}>
            <div className="note-form-field">
              <label>Client Name</label>

              <select
                name="clientId"
                value={formData.clientId}
                onChange={handleChange}
                required
              >
                <option value="">Select a client</option>

                {clients.map((client) => (
                  <option key={client.clientId} value={client.clientId}>
                    {client.name} ({client.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="note-form-field">
              <label>Note Title</label>

              <input
                type="text"
                name="title"
                placeholder="Enter note title"
                value={formData.title}
                onChange={handleChange}
                maxLength={150}
                required
              />
            </div>

            <div className="note-form-field">
              <label>Note Content</label>

              <textarea
                name="content"
                placeholder="Write your private note..."
                rows="6"
                value={formData.content}
                onChange={handleChange}
                maxLength={10000}
                required
              />
            </div>

            <div className="note-form-actions">
              <button
                type="button"
                className="cancel-note-btn"
                onClick={() => {
                  setShowForm(false);
                  setFormData({
                    clientId: "",
                    title: "",
                    content: "",
                  });
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-note-btn"
                disabled={saving || clients.length === 0}
              >
                {saving
                  ? "Saving..."
                  : editingNote
                    ? "Update Note"
                    : "Save Note"}
              </button>
            </div>

            {clients.length === 0 && (
              <p>No active clients are available for notes.</p>
            )}
          </form>
        </div>
      )}

      {/* Notes List */}

      <div className="notes-list-section">
        <div className="notes-list-heading">
          <h2>Recent Notes</h2>
          <span>{filteredNotes.length} notes</span>
        </div>

        {loading ? (
          <div className="notes-empty-state">
            <h3>Loading notes...</h3>
            <p>Please wait while your notes are retrieved.</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="notes-empty-state">
            <div className="empty-notes-icon">
              <FileText size={32} />
            </div>

            <h3>{searchTerm ? "No matching notes" : "No notes yet"}</h3>

            <p>
              {searchTerm
                ? "Try searching with a different keyword."
                : "Your client notes will appear here once you create them."}
            </p>

            {!searchTerm && (
              <button
                className="create-first-note-btn"
                onClick={() => {
                  setError("");
                  setShowForm(true);
                }}
              >
                <Plus size={17} />
                Create Your First Note
              </button>
            )}
          </div>
        ) : (
          <div className="notes-grid">
            {filteredNotes.map((note) => (
              <div className="note-card" key={note.id}>
                <div className="note-card-top">
                  <div className="note-card-icon">
                    <FileText size={20} />
                  </div>

                  <button
                    className="delete-note-btn"
                    onClick={() => handleDeleteNote(note.id)}
                    title="Delete note"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>

                <h3>{note.title}</h3>

                <p className="note-client-name">Client: {note.clientName}</p>

                <p className="note-preview">{note.content}</p>

                <div className="note-card-footer">
                  <span>{note.date}</span>

                  <button onClick={() => setSelectedNote(note)}>
                    View Note
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View Note Modal */}

      {selectedNote && (
        <div className="note-modal-overlay">
          <div className="note-modal">
            <div className="note-form-header">
              <h2>{selectedNote.title}</h2>

              <button
                className="close-note-btn"
                onClick={() => setSelectedNote(null)}
              >
                <X size={20} />
              </button>
            </div>

            <p className="note-modal-client">
              Client: {selectedNote.clientName}
            </p>

            <p className="note-modal-date">Created: {selectedNote.date}</p>

            <div className="note-modal-content">{selectedNote.content}</div>

            <button
              className="save-note-btn"
              onClick={() => {
                setFormData({
                  clientId: selectedNote.clientId || "",
                  title: selectedNote.title,
                  content: selectedNote.content,
                });

                setEditingNote(selectedNote);
                setSelectedNote(null);
                setShowForm(true);
                setError("");
              }}
            >
              <Pencil size={16} />
              Edit Note
            </button>

            <button
              className="cancel-note-btn"
              onClick={() => setSelectedNote(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;
