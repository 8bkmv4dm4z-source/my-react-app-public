/**
 * Workshops.jsx — Unified All/Mine Display (Enhanced)
 * ---------------------------------------------------
 * - Supports auto detection of user's registered workshops from backend.
 * - Correctly updates "הרשם / בטל הרשמה" buttons.
 * - Controlled via viewMode in WorkshopsContext.
 */

import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import WorkshopCard from "../../Components/WorkshopCard";
import WorkshopParticipantsModal from "../../Components/WorkshopParticipantsModal";
import { useAuth } from "../../layouts/AuthLayout";
import { useWorkshops } from "../../layouts/WorkshopContext";

export default function Workshops() {
  const navigate = useNavigate();
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);

  const { isLoggedIn, isAdmin, user, searchQuery, setSearchQuery } = useAuth();
  const {
    displayedWorkshops,
    registeredWorkshopIds,
    setRegisteredWorkshopIds,
    setWorkshops,
    fetchWorkshops,
    loading,
    error,
    viewMode,
  } = useWorkshops();

  const [searchBy, setSearchBy] = useState("all");

  // === Fetch workshops (only in "all" mode) ===
  useEffect(() => {
    const load = async () => {
      if (viewMode === "mine") return;
      const params = { q: searchQuery, field: searchBy };
      await fetchWorkshops(params);
    };
    load();
  }, [searchQuery, searchBy, viewMode]);

  // ✅ Fetch user registered workshops once logged in
  useEffect(() => {
    const fetchRegistered = async () => {
      if (!isLoggedIn) {
        setRegisteredWorkshopIds([]);
        return;
      }
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/workshops/registered", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load registrations");
        setRegisteredWorkshopIds(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("❌ Error fetching registered workshops:", err);
      }
    };
    fetchRegistered();
  }, [isLoggedIn]);

  // === Handle search input ===
  const handleSearch = (e) => setSearchQuery(e.target.value);

  // === Filter logic ===
  const filteredWorkshops = useMemo(() => {
    if (!displayedWorkshops) return [];

    // Case: "mine" view — show only user's workshops
    if (viewMode === "mine" && user?._id) {
      return displayedWorkshops.filter((w) =>
        registeredWorkshopIds.includes(w._id)
      );
    }

    // Case: "all" view — apply search
    if (!searchQuery.trim()) return displayedWorkshops;
    const query = searchQuery.trim().toLowerCase();

    return displayedWorkshops.filter((w) => {
      const fields =
        searchBy === "all"
          ? [
              w.title,
              w.type,
              w.ageGroup,
              w.city,
              w.coach,
              w.day,
              w.hour,
              w.description,
              String(w.price),
            ]
          : [w[searchBy]];

      return fields
        .filter(Boolean)
        .map((s) => s.toString().toLowerCase())
        .some((f) => f.startsWith(query));
    });
  }, [displayedWorkshops, searchQuery, searchBy, viewMode, registeredWorkshopIds]);

  // === Actions ===
  const handleRegister = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/workshops/${id}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration error");
      setRegisteredWorkshopIds((prev) => [...prev, id]);
      alert("✅ נרשמת בהצלחה לסדנה!");
    } catch (err) {
      console.error("❌ Register error:", err);
      alert("❌ שגיאה בהרשמה לסדנה");
    }
  };

  const handleUnregister = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/workshops/${id}/unregister`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Unregister error");
      setRegisteredWorkshopIds((prev) => prev.filter((x) => x !== id));
      alert("✅ ההרשמה בוטלה בהצלחה");
    } catch (err) {
      console.error("❌ Unregister error:", err);
      alert("❌ שגיאה בביטול ההרשמה");
    }
  };

  const handleDeleteWorkshop = async (id) => {
    if (!window.confirm("למחוק את הסדנה לצמיתות?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/workshops/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete error");
      setWorkshops((prev) => prev.filter((w) => w._id !== id));
    } catch (err) {
      console.error("❌ Delete error:", err);
      alert("❌ שגיאה במחיקת הסדנה");
    }
  };

  const handleManageParticipants = (id) => {
    const found = displayedWorkshops.find((w) => w._id === id);
    if (found) setSelectedWorkshop(found);
  };

  const handleEditWorkshop = (id) => navigate(`/editworkshop/${id}`);

  // === Render ===
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50 p-6 md:p-10" dir="rtl">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6 text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2 font-[Poppins]">
          {viewMode === "mine" ? "הסדנאות שלי" : "כלל הסדנאות"}
        </h2>
        <p className="text-gray-600 text-sm md:text-base">
          {viewMode === "mine"
            ? "צפו ובטלו הרשמות לסדנאות שלכם"
            : "חפש, הירשם או ערוך סדנאות בקלות"}
        </p>
      </div>

      {/* Search Bar (only in all mode) */}
      {viewMode === "all" && (
        <div className="max-w-6xl mx-auto bg-white/90 backdrop-blur border border-gray-200 shadow-md rounded-2xl p-5 flex flex-wrap justify-center items-center gap-3">
          <select
            value={searchBy}
            onChange={(e) => setSearchBy(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-300 bg-white text-sm text-gray-800 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">חפש בכל</option>
            <option value="title">שם</option>
            <option value="type">סוג</option>
            <option value="city">עיר</option>
            <option value="coach">מאמן</option>
            <option value="day">יום</option>
            <option value="hour">שעה</option>
            <option value="description">תיאור</option>
            <option value="price">מחיר</option>
          </select>

          <div className="relative">
            <input
              type="text"
              placeholder="חפש סדנה..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-64 pl-10 pr-4 py-2 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
          </div>
        </div>
      )}

      {/* Workshops Grid */}
      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto mt-10">
        {loading ? (
          <p className="text-center text-gray-500 mt-10 animate-pulse">⏳ טוען סדנאות...</p>
        ) : error ? (
          <p className="text-center text-red-500 font-medium mt-10">❌ {error}</p>
        ) : filteredWorkshops.length === 0 ? (
          <p className="text-center text-gray-600 mt-10">
            {viewMode === "mine" ? "לא נמצאו סדנאות רשומות." : "לא נמצאו סדנאות תואמות."}
          </p>
        ) : (
          filteredWorkshops.map((w, idx) => (
            <div
              key={w._id}
              className="animate-[fadeIn_0.6s_ease-in-out_both]"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <WorkshopCard
                {...w}
                isLoggedIn={isLoggedIn}
                isAdmin={isAdmin}
                isRegistered={registeredWorkshopIds.includes(w._id)}
                onRegister={() => handleRegister(w._id)}
                onUnregister={() => handleUnregister(w._id)}
                onDeleteWorkshop={() => handleDeleteWorkshop(w._id)}
                onManageParticipants={() => handleManageParticipants(w._id)}
                onEditWorkshop={() => handleEditWorkshop(w._id)}
                searchQuery={searchQuery}
              />
            </div>
          ))
        )}
      </div>

      {/* Participants Modal */}
      {selectedWorkshop && (
        <WorkshopParticipantsModal
          workshop={selectedWorkshop}
          onClose={() => setSelectedWorkshop(null)}
          onEditWorkshop={() => handleEditWorkshop(selectedWorkshop._id)}
        />
      )}
    </div>
  );
}
