/**
 * AppRoutes.jsx
 * Path: src/routes/AppRoutes/AppRoutes.jsx
 * Role: Manages all application routes (public + protected)
 */

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Workshops from "../../pages/Workshops/Workshops";
import Register from "../../pages/Register";
import Login from "../../pages/Login";
import Verify from "../../pages/Verify";
import Profile from "../../pages/Profile";
import Header from "../../Components/Header";
import Home from "../../pages/Home";
import EditWorkshop from "../../pages/EditWorkshop";
import { useAuth } from "../../layouts/AuthLayout";
import AllProfiles from "../../pages/AllProfiles";
import EditProfile from "../../pages/EditProfile";

function AppRoutes() {
  const {
    isLoggedIn,
    logout,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    loading,
    isAdmin,
  } = useAuth();

  const onLogout = () => {
    setSearchQuery("");
    setFilters({});
    logout();
  };

  // ⏳ Waiting for auth check (JWT)
  if (loading) {
    return (
      <div
        style={{
          textAlign: "center",
          paddingTop: "25vh",
          fontSize: "1.3rem",
          color: "#555",
        }}
      >
        טוען את המערכת...
      </div>
    );
  }

  return (
    <div className="app-layout">
      {/* Header visible only for logged-in users */}
      {isLoggedIn && <Header onLogout={onLogout} />}

      {/* Home page only for guests */}
      {!isLoggedIn && <Home />}

      <main className={`app-content ${!isLoggedIn ? "with-sidebar" : ""}`}>
        <Routes>
          {/* Public pages */}
          <Route path="/workshops" element={<Workshops />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<Verify />} />

          {/* Protected pages (only if logged in) */}
          {isLoggedIn && (
            <>
              <Route path="/myworkshops" element={<Workshops />} />
              <Route path="/profile" element={<Profile />} />
              {isAdmin && (
                <>
                  <Route path="/profiles" element={<AllProfiles />} />
                  <Route path="/editprofile/:id" element={<EditProfile />} />
                  {/* ✳️ Edit existing workshop OR create new one */}
                  <Route path="/editworkshop" element={<EditWorkshop />} />
                  <Route path="/editworkshop/:id" element={<EditWorkshop />} />
                  <Route path="/editworkshop/new" element={<EditWorkshop />} />

                </>
              )}
            </>
          )}

          {/* Default redirects */}
          <Route
            path="/"
            element={<Navigate to="/workshops" replace />}
          />
          <Route
            path="*"
            element={<Navigate to="/workshops" replace />}
          />
        </Routes>
      </main>
    </div>
  );
}

export default AppRoutes;
