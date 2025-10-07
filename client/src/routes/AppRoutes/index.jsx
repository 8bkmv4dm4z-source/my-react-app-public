/**
 * index.jsx
 * Path: src/routes/AppRoutes/index.jsx
 * Role: Application module.
 *
 * Component: (default export)
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

// index.jsx
// מבצע יצוא ברירת מחדל של הקומפוננטה AppRoutes. כך ניתן לייבא את הנתיבים
// באמצעות 'import AppRoutes from "../routes/AppRoutes"' מבלי לציין את שם הקובץ המדויק.
export { default } from './AppRoutes';
