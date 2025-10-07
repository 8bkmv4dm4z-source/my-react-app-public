/**
 * Home.jsx
 * Path: src/pages/Home/Home.jsx
 * Role: Page route (screen) component.
 *
 * Component: Home
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

import React from "react";
import { NavLink } from "react-router-dom";
// Legacy CSS removed; styling is now provided by Tailwind classes via index.css

// --- State, context & derived data below ---

function Home() {
  // --- Render ---
return (
    <aside className="home-sidebar">
      <h2>כללית סדנאות</h2>
      <nav>
        <ul>
          <li>
            <NavLink to="/workshops" className="nav-link">
              כל הסדנאות
            </NavLink>
          </li>
          <li>
            <NavLink to="/login" className="nav-link">
              התחברות
            </NavLink>
          </li>
          <li>
            <NavLink to="/register" className="nav-link">
              הרשמה
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default Home;
