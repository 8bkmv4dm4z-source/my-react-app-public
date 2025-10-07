   /**
    * ProfileContext.jsx
    * Path: src/layouts/ProfileContext/ProfileContext.jsx
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

* @param {any} children - See inline comments for how this prop is used.
    */

// layouts/ProfileContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

// --- State, context & derived data below ---

/*
 * קונטקסט ניהול פרופילים (משתמשים).
 *
 * Context זה מחזיק את רשימת כל המשתמשים באפליקציה ומספק פונקציות לקריאה, הוספה,
 * עדכון ומחיקה של פרופילים. בעתיד ניתן להחליף את פונקציות הטעינה ב־API לשרת
 * על מנת לקבל ולשלוח נתונים למסד נתונים אמיתי.
 */
const ProfileContext = createContext({
  profiles: [],
  setProfiles: () => {},
  selectedProfile: null,
  setSelectedProfile: () => {},
  addProfile: () => {},
  updateProfile: () => {},
  deleteProfile: () => {},
});

export const ProfileProvider = ({ children }) => {
  // נתוני ברירת מחדל. בעתיד יוחלף בקריאה ל־API
  const initialProfiles = [
    {
      id: 1,
      name: "ניר יטח",
      email: "nir@example.com",
      city: "תל אביב",
      phone: "050-1234567",
      role: "user",
      canCharge: false,
    },
    {
      id: 2,
      name: "דנה כהן",
      email: "dana@example.com",
      city: "חיפה",
      phone: "052-7654321",
      role: "admin",
      canCharge: true,
    },
    {
      id: 3,
      name: "ערן לוי",
      email: "eran@example.com",
      city: "ירושלים",
      phone: "054-9876543",
      role: "admin",
      canCharge: true,
    },
  ];

  const fetchProfiles = async () => {
    // מחזיר הבטחה המדמה קריאה לשרת. ניתן להחליף זאת ב־fetch אמיתי.
    return new Promise((resolve) => {
      setTimeout(() => resolve(initialProfiles), 500);
    });
  };

  // Local state hook
const [profiles, setProfiles] = useState([]);
  // Local state hook
const [selectedProfile, setSelectedProfile] = useState(null);

  // טעינת פרופילים פעם אחת בעת טעינת הקונטקסט
  useEffect(() => {
    (async () => {
      const data = await fetchProfiles();
      setProfiles(data);
    })();
  }, []);

  /**
   * addProfile – הוספת משתמש חדש לרשימת המשתמשים.
   */
  const addProfile = (profile) => {
    setProfiles((prev) => [...prev, profile]);
  };
  /**
   * updateProfile – עדכון פרופיל קיים. מחפש לפי id ומחליף את הערך.
   */
  const updateProfile = (updated) => {
    setProfiles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };
  /**
   * deleteProfile – מחיקת פרופיל לפי מזהה.
   */
  const deleteProfile = (id) => {
    setProfiles((prev) => prev.filter((p) => p.id !== id));
  };

  // --- Render ---
return (
    <ProfileContext.Provider
      value={{
        profiles,
        setProfiles,
        selectedProfile,
        setSelectedProfile,
        addProfile,
        updateProfile,
        deleteProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfiles = () => useContext(ProfileContext);
