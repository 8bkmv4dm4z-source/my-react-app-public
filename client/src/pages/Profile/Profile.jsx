/**
 * Profile.jsx — Tailwind Integrated Edition
 * -----------------------------------------
 * - Fully styled using TailwindCSS utilities.
 * - Removed legacy CSS and superAdmin logic.
 * - Modern responsive layout, RTL support, animation.
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProfiles } from "../../layouts/ProfileContext";
import { useAuth } from "../../layouts/AuthLayout";

export default function Profile() {
  const navigate = useNavigate();
  const { profiles, setProfiles } = useProfiles();
  const { isAdmin } = useAuth();

  // Mock current user (replace with real Auth user later)
  const currentUserId = 1;
  const currentUser = profiles.find((p) => p.id === currentUserId);
  const [form, setForm] = useState(currentUser || null);

  useEffect(() => {
    if (currentUser) setForm(currentUser);
  }, [currentUser]);

  if (!form)
    return (
      <p className="text-center text-red-500 mt-10 font-medium animate-pulse">
        ❌ המשתמש לא נמצא.
      </p>
    );

  const handleChange = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    setProfiles((prev) => prev.map((p) => (p.id === form.id ? form : p)));
    alert("✅ הפרופיל עודכן בהצלחה!");
  };

  const calcAge = (birthDate) => {
    if (!birthDate) return "";
    const diff = new Date() - new Date(birthDate);
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-indigo-50 to-rose-50 p-8 flex justify-center items-start"
      dir="rtl"
    >
      <div className="w-full max-w-lg bg-white shadow-xl rounded-2xl p-6 md:p-8 border border-gray-100 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-5 mb-6 border-b pb-4 border-gray-200">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
              form.name || "משתמש"
            )}&background=6366F1&color=fff&size=120`}
            alt="avatar"
            className="rounded-full w-24 h-24 shadow-md"
          />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 font-[Poppins]">
              {form.name || "משתמש"}
            </h2>
            <p className="text-gray-600 mt-1">
              {form.role === "admin" ? "מנהל מערכת" : "משתמש רגיל"}
            </p>
          </div>
        </div>

        {/* Editable Fields */}
        <div className="space-y-4">
          {isAdmin && (
            <>
              <label className="block">
                <span className="text-gray-700">שם מלא:</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="text-gray-700">אימייל:</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="text-gray-700">תפקיד:</span>
                <select
                  value={form.role}
                  onChange={(e) => handleChange("role", e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                >
                  <option value="user">משתמש</option>
                  <option value="admin">מנהל</option>
                </select>
              </label>
            </>
          )}

          <label className="block">
            <span className="text-gray-700">תאריך לידה:</span>
            <input
              type="date"
              value={form.birthDate || ""}
              onChange={(e) => handleChange("birthDate", e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            />
          </label>

          {form.birthDate && (
            <p className="text-gray-600 text-sm">
              גיל: <strong>{calcAge(form.birthDate)}</strong>
            </p>
          )}

          <label className="block">
            <span className="text-gray-700">עיר:</span>
            <input
              type="text"
              value={form.city || ""}
              onChange={(e) => handleChange("city", e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="text-gray-700">טלפון:</span>
            <input
              type="text"
              value={form.phone || ""}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            />
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={!!form.canCharge}
              onChange={(e) => handleChange("canCharge", e.target.checked)}
              className="w-5 h-5 accent-indigo-500"
            />
            <span className="text-gray-700">הרשאה לגבייה</span>
          </label>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap gap-3 justify-end">
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold shadow-sm hover:bg-indigo-700 active:scale-95 transition"
          >
            💾 שמור שינויים
          </button>

          {isAdmin && (
            <button
              onClick={() => navigate("/profiles")}
              className="px-5 py-2.5 rounded-xl bg-rose-100 text-rose-700 font-semibold shadow-sm hover:bg-rose-200 active:scale-95 transition"
            >
              נהל פרופילים
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
