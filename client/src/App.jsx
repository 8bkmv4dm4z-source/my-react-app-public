/**
 * App.jsx
 * Path: src/App.jsx
 * Role: Application module.
 *
 * Component: App
 * Summary:
 * - Provides the main responsibilities of this module.
 * - Comments are written in English only.
 * - Logic is unchanged; documentation and structure notes were added.
 * Sections:
 * - Imports
 * - State & Context
 * - Derived data (memoized computations)
 * - Event handlers (navigation, form, filters)
 * - Render (JSX structure)
 * Data flow:
 * - Props -> local hooks -> derived values -> UI.
 * - Context (if used) is read-only here unless setter functions are invoked.
 * Props:
 * (No explicit props or destructured props detected.)
 */

// קובץ ראשי של אפליקציית React.
// כאן אנו שומרים את הסטייט הראשי של התחברות המשתמש
// ומשתמשים ב־AppRoutes לצורך ניהול ניווט בהתאם להרשאות.
import React, { useState } from "react";
import AppRoutes from "./routes/AppRoutes";

// --- State, context & derived data below ---

function App() {
  // --- Render ---
  return (
    <AppRoutes />
  );
}

export default App;
