// server/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * 🔒 protect — verifies JWT and attaches user to req.user
 */
exports.protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ message: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select(
      "-otpCode -otpExpires -otpAttempts"
    );
    if (!user) return res.status(401).json({ message: "Invalid token" });

    req.user = user;
    next();
  } catch (err) {
    console.error("❌ protect middleware error:", err);
    res.status(401).json({ message: "Unauthorized", error: err.message });
  }
};

/**
 * 🛡️ isAdmin — allows access only for admin users
 */
exports.isAdmin = (req, res, next) => {
  if (req.user?.role === "admin") return next();
  return res.status(403).json({ message: "Admin only" });
};
