/**
 * Header.jsx — Two Separate Buttons (All / My Workshops)
 * -------------------------------------------------------
 * - Displays two distinct buttons: "כל הסדנאות" and "הסדנאות שלי".
 * - Each updates viewMode separately and refreshes displayed workshops.
 * - Fully styled with Tailwind.
 * - Admin button "צור סדנה חדשה" opens EditWorkshop in create mode.
 */

import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import MyWorkshopsIcon from "../Icons/MyWorkshopsIcon.jsx";
import ProfileIcon from "../Icons/ProfileIcon.jsx";
import LogoutIcon from "../Icons/LogoutIcon.jsx";
import WorkshopsIcon from "../Icons/WorkshopsIcon.jsx";
import UsersIcon from "../Icons/UsersIcon.jsx";
import { useAuth } from "../../layouts/AuthLayout";
import { useWorkshops } from "../../layouts/WorkshopContext";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAdmin, setIsAdmin, setIsLoggedIn } = useAuth();
  const { viewMode, setViewMode } = useWorkshops();

  // --- Scroll shadow effect ---
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // --- Classes ---
  const linkBase =
    "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all hover:scale-105";
  const linkActive = "text-indigo-700 bg-indigo-50";
  const linkIdle = "text-gray-700 hover:bg-gray-50";

  const isActive = (to) => location.pathname.startsWith(to);

  // --- Logout handler ---
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setIsAdmin(false);
    navigate("/login");
  };

  // --- Render ---
  return (
    <header
      className={`${
        isScrolled ? "backdrop-blur bg-white/85 shadow-sm" : "bg-white"
      } sticky top-0 z-40 border-b border-gray-200`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Left side: Brand / Logo */}
        <button
          onClick={() => navigate("/")}
          className="text-base font-heading font-semibold text-gray-900 hover:text-indigo-700 transition"
        >
          Clalit Workshops
        </button>

        {/* Right side: navigation links */}
        <div className="flex items-center gap-2">
          {/* All Workshops */}
          <button
            onClick={() => {
              setViewMode("all");
              if (!location.pathname.startsWith("/workshops"))
                navigate("/workshops");
            }}
            className={`${linkBase} ${
              isActive("/workshops") && viewMode === "all"
                ? linkActive
                : linkIdle
            }`}
          >
            <WorkshopsIcon />
            <span>כל הסדנאות</span>
          </button>

          {/* My Workshops */}
          <button
            onClick={() => {
              setViewMode("mine");
              if (!location.pathname.startsWith("/workshops"))
                navigate("/workshops");
            }}
            className={`${linkBase} ${
              isActive("/workshops") && viewMode === "mine"
                ? linkActive
                : linkIdle
            }`}
          >
            <MyWorkshopsIcon />
            <span>הסדנאות שלי</span>
          </button>

          {/* Profile */}
          <NavLink
            to="/profile"
            className={`${linkBase} ${
              isActive("/profile") ? linkActive : linkIdle
            }`}
          >
            <ProfileIcon />
            <span>פרופיל</span>
          </NavLink>

          {/* Admin links */}
          {isAdmin && (
            <>
              <NavLink
                to="/admin/users"
                className={`${linkBase} ${
                  isActive("/admin") ? linkActive : linkIdle
                }`}
              >
                <UsersIcon />
                <span>ניהול משתמשים</span>
              </NavLink>

              {/* Create New Workshop (always new mode) */}
              <button
                onClick={() => {
                  localStorage.removeItem("editingWorkshopId"); // Clean previous edit state if any
                  navigate("/editworkshop"); // Opens create mode
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700 hover:scale-105"
              >
                ➕ צור סדנה חדשה
              </button>
            </>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
          >
            <LogoutIcon />
            <span>התנתקות</span>
          </button>
        </div>
      </nav>
    </header>
  );
}
