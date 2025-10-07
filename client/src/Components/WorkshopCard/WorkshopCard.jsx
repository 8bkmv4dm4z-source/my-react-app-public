import React, { useState, useEffect } from "react";

export default function WorkshopCard({
  _id,
  title,
  description,
  coach,
  city,
  studio,
  day,
  hour,
  price,
  image,
  available,
  participantsCount = 0,
  maxParticipants = 0,
  isLoggedIn,
  isAdmin,
  isRegistered,
  onRegister,
  onUnregister,
  onDeleteWorkshop,
  onManageParticipants,
  onEditWorkshop,
  searchQuery = "",
}) {
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [count, setCount] = useState(participantsCount); // ✅ local live counter

  // עדכון אוטומטי אם נשלף נתון חדש מהשרת
  useEffect(() => {
    setCount(participantsCount);
  }, [participantsCount]);

  const isFull = maxParticipants > 0 && count >= maxParticipants;
  const canRegister = available && !isFull;

  /** 🔍 Highlight search query inside text */
  const highlight = (text = "") => {
    if (!searchQuery.trim()) return text;
    const regex = new RegExp(`(${searchQuery})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 font-semibold rounded px-1">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  /** ✅ Registration handlers */
  const handleRegister = async () => {
    if (!canRegister) return;
    try {
      await onRegister?.(_id);
      setCount((prev) => prev + 1); // מיידית בצד לקוח
    } catch (err) {
      console.error("❌ Register failed:", err);
    }
  };

  const handleUnregister = async () => {
    try {
      await onUnregister?.(_id);
      setCount((prev) => Math.max(prev - 1, 0)); // הגנה שלא ירד מתחת ל־0
    } catch (err) {
      console.error("❌ Unregister failed:", err);
    }
  };

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-gray-200 shadow-lg bg-white overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
      {/* === Image === */}
      <div className="h-52 relative overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transform transition-transform duration-700 hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-100 text-gray-400 text-sm">
            אין תמונה
          </div>
        )}
        {!available && (
          <div className="absolute inset-0 bg-gray-800/60 flex items-center justify-center text-white text-lg font-bold">
            לא זמינה
          </div>
        )}
      </div>

      {/* === Content === */}
      <div className="p-5 flex flex-col gap-3">
        <h3 className="text-xl font-bold text-gray-900 text-center font-[Poppins] leading-tight">
          {highlight(title)}
        </h3>

        <div className="text-sm text-gray-700 space-y-1 border-t border-gray-100 pt-3">
          <p><strong>עיר:</strong> {highlight(city)}</p>
          <p><strong>יום:</strong> {day}</p>
          <p><strong>שעה:</strong> {hour}</p>
          {studio && <p><strong>סטודיו:</strong> {highlight(studio)}</p>}
          <p><strong>מאמן:</strong> {highlight(coach)}</p>
          <p>
            <strong>משתתפים:</strong>{" "}
            <span className="font-semibold">
              {count}/{maxParticipants}
            </span>
          </p>
          <p>
            <strong>מחיר:</strong>{" "}
            <span className="text-indigo-700 font-semibold">{price} ₪</span>
          </p>
        </div>

        {description && (
          <div className="text-sm text-gray-600 mt-3">
            <p className={showFullDesc ? "" : "line-clamp-3"}>
              {highlight(description)}
            </p>
            {description.length > 160 && (
              <button
                onClick={() => setShowFullDesc(!showFullDesc)}
                className="text-blue-600 text-sm hover:underline mt-1"
              >
                {showFullDesc ? "הצג פחות" : "קרא עוד"}
              </button>
            )}
          </div>
        )}

        {/* === Buttons === */}
        <div className="mt-4 flex flex-col gap-2">
          {isLoggedIn && (
            <>
              {isRegistered ? (
                <button
                  onClick={handleUnregister}
                  className="w-full py-2 rounded-xl bg-yellow-400 text-gray-900 font-semibold hover:bg-yellow-500 transition"
                >
                  בטל הרשמה
                </button>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={!canRegister}
                  className={`w-full py-2 rounded-xl font-semibold text-white transition ${
                    canRegister
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  {canRegister ? "הירשם" : "מלאה"}
                </button>
              )}
            </>
          )}

          {isAdmin && (
            <div className="flex flex-wrap justify-center gap-2 border-t border-gray-100 pt-2">
              <button
                onClick={() => onEditWorkshop?.(_id)}
                className="flex-1 py-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700"
              >
                ערוך
              </button>
              <button
                onClick={() => onManageParticipants?.(_id)}
                className="flex-1 py-2 rounded-xl bg-orange-400 text-white font-medium hover:bg-orange-500"
              >
                משתתפים
              </button>
              <button
                onClick={() => onDeleteWorkshop?.(_id)}
                className="flex-1 py-2 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700"
              >
                מחק
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
