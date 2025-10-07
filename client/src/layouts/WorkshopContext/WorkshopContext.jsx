/**
 * WorkshopContext.jsx
 * ----------------------------------------------------------
 * Centralized data context for all workshops.
 * Handles fetching, caching, and switching between "all" and "mine" modes.
 * Automatically reloads data when viewMode changes.
 */

import React, { createContext, useContext, useEffect, useState } from "react";

const WorkshopContext = createContext();

export const WorkshopProvider = ({ children }) => {
  const [workshops, setWorkshops] = useState([]);
  const [registeredWorkshopIds, setRegisteredWorkshopIds] = useState([]);
  const [displayedWorkshops, setDisplayedWorkshops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("all"); // "all" | "mine"

  /* =========================================================
     FETCH HELPERS
  ========================================================= */

  const fetchAllWorkshops = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/workshops`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch workshops");
      setWorkshops(Array.isArray(data) ? data : []);
      setDisplayedWorkshops(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Error fetching all workshops:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegisteredWorkshops = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/workshops/registered`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to fetch registered workshops");

      setRegisteredWorkshopIds(data);
      const mine = workshops.filter((w) => data.includes(w._id));
      setDisplayedWorkshops(mine);
    } catch (err) {
      console.error("❌ Error fetching registered workshops:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     AUTO FETCH ON MODE CHANGE
  ========================================================= */
  useEffect(() => {
    if (viewMode === "all") {
      fetchAllWorkshops();
    } else if (viewMode === "mine") {
      fetchRegisteredWorkshops();
    }
  }, [viewMode]);

  /* =========================================================
     LOCAL HELPERS
  ========================================================= */
  const addWorkshopLocal = (w) => {
    setWorkshops((prev) => [w, ...prev]);
    if (viewMode === "all") setDisplayedWorkshops((prev) => [w, ...prev]);
  };

  const updateWorkshopLocal = (updated) => {
    setWorkshops((prev) => prev.map((w) => (w._id === updated._id ? updated : w)));
    setDisplayedWorkshops((prev) =>
      prev.map((w) => (w._id === updated._id ? updated : w))
    );
  };

  const deleteWorkshopLocal = (id) => {
    setWorkshops((prev) => prev.filter((w) => w._id !== id));
    setDisplayedWorkshops((prev) => prev.filter((w) => w._id !== id));
  };

  /* =========================================================
     CONTEXT RETURN
  ========================================================= */
  return (
    <WorkshopContext.Provider
      value={{

        workshops,
        setWorkshops,
        displayedWorkshops,
        registeredWorkshopIds,
        setRegisteredWorkshopIds,
        loading,
        error,
        viewMode,
        setViewMode,
        addWorkshopLocal,
        updateWorkshopLocal,
        deleteWorkshopLocal,
      }}
    >
      {children}
    </WorkshopContext.Provider>
  );
};

export const useWorkshops = () => useContext(WorkshopContext);
