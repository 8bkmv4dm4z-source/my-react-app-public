// server/models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Sub-schema for family members
const FamilyMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    relation: { type: String, default: "" },
  },
  { _id: false }
);

// Main user schema
const UserSchema = new mongoose.Schema(
  {
    // Basic info
    name: { type: String, default: "" },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, select: false },

    // Personal data
    idNumber: { type: String, default: "" },
    birthDate: { type: String, default: "" },
    phone: { type: String, default: "" },
    city: { type: String, default: "" },
    canCharge: { type: Boolean, default: false },

    // Family members
    familyMembers: { type: [FamilyMemberSchema], default: [] },

    // Roles
    role: { type: String, enum: ["user", "admin"], default: "user" },

    // OTP fields
    otpCode: { type: String, select: false },
    otpExpires: { type: Number, default: 0 },
    otpAttempts: { type: Number, default: 0, select: false },

    // Password management flags
    hasPassword: { type: Boolean, default: false },
    temporaryPassword: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/* ============================================================
   🔒 Methods
   ============================================================ */

// Hash and set password
UserSchema.methods.setPassword = async function (plainPassword) {
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(plainPassword, salt);
  this.hasPassword = true;
  this.temporaryPassword = false;
};

// Compare password
UserSchema.methods.validatePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

module.exports = mongoose.model("User", UserSchema);
