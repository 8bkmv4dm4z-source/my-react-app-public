/**
 * AllProfiles.jsx
 * Fetches all users (admin/superadmin only)
 * - GET /api/users
 * - Allows search and navigation to EditProfile
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../layouts/AuthLayout";
// Legacy CSS removed; styling is now provided by Tailwind classes via index.css

export default function AllProfiles() {
  const { isAdmin } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // ✅ Fetch all profiles from backend
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load users");
        setProfiles(data);
      } catch (err) {
        console.error("❌ Error fetching profiles:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, []);

  if (!isAdmin)
    return <p style={{ textAlign: "center" }}>⛔ אין לך הרשאה.</p>;

  if (loading) return <p className="loading">⏳ Loading profiles...</p>;
  if (error) return <p className="error">❌ {error}</p>;

  // All profiles are visible for admins.  In this simple implementation there is
  // no separate superAdmin role, so just display the list unfiltered.
  const visibleProfiles = profiles;

  const filtered = visibleProfiles.filter((p) =>
    Object.values(p).join(" ").toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (profileId) => navigate(`/editprofile/${profileId}`);

  return (
    <div className="profiles-page">
      <h2 className="page-title">כל המשתמשים</h2>

      <input
        type="text"
        className="search-bar"
        placeholder="חפש לפי שם, אימייל, עיר או תפקיד..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table className="profiles-table">
        <thead>
          <tr>
            <th>שם</th>
            <th>אימייל</th>
            <th>עיר</th>
            <th>טלפון</th>
            <th>תפקיד</th>
            <th>גבייה</th>
            <th>פעולות</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((p) => (
            <tr key={p._id}>
              <td>{p.name}</td>
              <td>{p.email}</td>
              <td>{p.city || "-"}</td>
              <td>{p.phone || "-"}</td>
              <td>{p.role}</td>
              <td>{p.canCharge ? "✅" : "❌"}</td>
              <td>
                <button onClick={() => handleEdit(p._id)} className="edit-btn">
                  ערוך
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filtered.length === 0 && (
        <p className="no-results">לא נמצאו תוצאות מתאימות</p>
      )}
    </div>
  );
}
