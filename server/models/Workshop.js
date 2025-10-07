// models/Workshop.js
const mongoose = require("mongoose");

/**
 * Workshop Schema
 * ----------------------------------
 * - Tracks participants and max capacity
 * - Automatically updates participantsCount on save
 */
const WorkshopSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: { type: String, default: "", trim: true },
    ageGroup: { type: String, default: "", trim: true },
    city: { type: String, default: "", trim: true },
    studio: { type: String, default: "", trim: true },
    coach: { type: String, default: "", trim: true },
    day: { type: String, default: "", trim: true },
    hour: { type: String, default: "", trim: true },
    available: { type: Boolean, default: true },
    description: { type: String, default: "" },
    price: { type: Number, default: 0 },
    image: { type: String, default: "" },

    /** ✅ Participants management */
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    participantsCount: { type: Number, default: 0 },

    /** ✅ Capacity control */
    maxParticipants: { type: Number, default: 20, min: 0 },
  },
  { timestamps: true }
);

/* ============================================================
   ✅ Middleware — Auto update participantsCount on save
   ============================================================ */
WorkshopSchema.pre("save", function (next) {
  this.participantsCount = this.participants.length;
  next();
});

/* ============================================================
   ✅ Helper method — Check capacity before adding
   ============================================================ */
WorkshopSchema.methods.canAddParticipant = function () {
  if (this.maxParticipants === 0) return true; // unlimited
  return this.participants.length < this.maxParticipants;
};

module.exports = mongoose.model("Workshop", WorkshopSchema);
