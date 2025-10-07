/**
 * EditProfile.jsx
 * Fetch one user by ID (GET /api/users/:id)
 * Update all user fields (PUT /api/users/:id)
 */

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../layouts/AuthLayout";
// Legacy CSS removed; styling is now provided by Tailwind classes via index.css

export default function EditProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // 🟢 Fetch profile by ID
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "User not found");
        setForm(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const handleChange = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // 🟢 Save updated profile
  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      alert("✅ הנתונים עודכנו בהצלחה!");
      navigate("/profiles");
    } catch (err) {
      alert("❌ שגיאה בעדכון המשתמש: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>⏳ טוען נתונים...</p>;
  if (error) return <p>❌ {error}</p>;
  if (!form) return <p>❌ לא נמצא משתמש לעריכה.</p>;

  return (
    <div className="profile-page">
      <div className="profile-card">
        <h2>עריכת פרופיל</h2>

        <label>
          שם מלא:
          <input value={form.name || ""} onChange={(e) => handleChange("name", e.target.value)} />
        </label>

        <label>
          אימייל:
          <input type="email" value={form.email || ""} onChange={(e) => handleChange("email", e.target.value)} />
        </label>

        <label>
          סיסמה חדשה:
          <input
            type="password"
            placeholder="השאר ריק אם לא מעדכן"
            onChange={(e) => handleChange("password", e.target.value)}
          />
        </label>

        <label>
          תאריך לידה:
          <input type="date" value={form.birthDate || ""} onChange={(e) => handleChange("birthDate", e.target.value)} />
        </label>

        <label>
          עיר:
          <input value={form.city || ""} onChange={(e) => handleChange("city", e.target.value)} />
        </label>

        <label>
          טלפון:
          <input value={form.phone || ""} onChange={(e) => handleChange("phone", e.target.value)} />
        </label>

        {isAdmin && (
          <>
            <label className="checkbox-line">
              הרשאה לגבייה:
              <input
                type="checkbox"
                checked={!!form.canCharge}
                onChange={(e) => handleChange("canCharge", e.target.checked)}
              />
            </label>

            <label>
              תפקיד:
              <select value={form.role || "user"} onChange={(e) => handleChange("role", e.target.value)}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </label>
          </>
        )}

        <div className="profile-actions">
          <button onClick={handleSave} disabled={saving}>
            {saving ? "שומר..." : "💾 שמור"}
          </button>
          <button onClick={() => navigate("/profiles")}>ביטול</button>
        </div>
      </div>
    </div>
  );
}
