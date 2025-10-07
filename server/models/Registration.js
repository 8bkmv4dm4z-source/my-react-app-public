// server/models/Registration.js
const mongoose = require("mongoose");
const RegistrationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  workshop: { type: mongoose.Schema.Types.ObjectId, ref: "Workshop", required: true },
  registeredAt: { type: Date, default: Date.now },
}, { timestamps: true });

RegistrationSchema.index({ user: 1, workshop: 1 }, { unique: true });
module.exports = mongoose.model("Registration", RegistrationSchema);
