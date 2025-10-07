import React, { useEffect, useState } from "react";

/**
 * WorkshopParticipantsModal.jsx — Editable Participants Modal
 * -----------------------------------------------------------
 * - Lists all participants of the workshop.
 * - Each user row can switch between view and edit mode.
 * - Admin can update user data directly (except password unless changed).
 */

export default function WorkshopParticipantsModal({ workshop, onClose }) {
  const [participants, setParticipants] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // 🔹 Fetch participants on load
  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/workshops/${workshop._id}/participants`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load participants");
        const data = await res.json();
        setParticipants(Array.isArray(data) ? data : data.participants || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchParticipants();
  }, [workshop?._id]);

  // 🔹 Toggle edit mode for a user
  const handleEditToggle = (user) => {
    if (editingUserId === user._id) {
      setEditingUserId(null);
      setEditForm({});
    } else {
      setEditingUserId(user._id);
      setEditForm({ ...user, password: "" });
    }
  };

  // 🔹 Handle input change in edit mode
  const handleChange = (key, value) => {
    setEditForm((prev) => ({ ...prev, [key]: value }));
  };

  // 🔹 Save updated user
  const handleSaveUser = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const payload = { ...editForm };

      // Remove empty password field
      if (!payload.password) delete payload.password;

      const res = await fetch(`/api/users/${editingUserId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to update user");

      // Replace user in state
      setParticipants((prev) =>
        prev.map((p) => (p._id === editingUserId ? data.user || payload : p))
      );

      setEditingUserId(null);
      setEditForm({});
    } catch (err) {
      alert(err.message || "שגיאה בשמירת המשתמש");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-lg animate-[fadeIn_.15s_ease]">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-heading font-semibold">
            משתתפים בסדנה: {workshop.title}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg px-3 py-1 text-sm text-gray-600 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {/* Loading / Error */}
        {loading && <p className="text-sm text-gray-600">טוען...</p>}
        {error && !loading && (
          <p className="text-sm text-rose-600">שגיאה: {error}</p>
        )}

        {/* Participants list */}
        {!loading && !error && (
          <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200">
            {participants.map((p) => (
              <li
                key={p._id}
                className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-4 py-3"
              >
                {editingUserId === p._id ? (
                  // === EDIT MODE ===
                  <div className="flex flex-col w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input
                        className="border rounded-lg px-2 py-1 text-sm"
                        value={editForm.name || ""}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="שם"
                      />
                      <input
                        className="border rounded-lg px-2 py-1 text-sm"
                        value={editForm.email || ""}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="אימייל"
                      />
                      <input
                        className="border rounded-lg px-2 py-1 text-sm"
                        value={editForm.idNumber || ""}
                        onChange={(e) =>
                          handleChange("idNumber", e.target.value)
                        }
                        placeholder="תעודת זהות"
                      />
                      <input
                        className="border rounded-lg px-2 py-1 text-sm"
                        type="password"
                        value={editForm.password || ""}
                        onChange={(e) =>
                          handleChange("password", e.target.value)
                        }
                        placeholder="סיסמה (ריק = לא משתנה)"
                      />
                    </div>

                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        onClick={() => handleEditToggle(p)}
                        disabled={saving}
                        className="px-3 py-1 rounded-lg text-sm border border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        ביטול
                      </button>
                      <button
                        onClick={handleSaveUser}
                        disabled={saving}
                        className="px-3 py-1 rounded-lg text-sm bg-green-600 text-white hover:bg-green-700"
                      >
                        {saving ? "שומר..." : "שמור"}
                      </button>
                    </div>
                  </div>
                ) : (
                  // === VIEW MODE ===
                  <>
                    <div className="text-sm w-full">
                      <div className="font-medium text-gray-900">{p.name}</div>
                      <div className="text-gray-700">{p.email}</div>
                      {p.idNumber && (
                        <div className="text-gray-500 text-xs">
                          ת"ז: {p.idNumber}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleEditToggle(p)}
                      className="rounded-lg bg-indigo-600 text-white text-sm px-3 py-1 hover:bg-indigo-700"
                    >
                      ערוך
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
}
