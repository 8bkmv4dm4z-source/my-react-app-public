// server/routes/users.js
const express = require("express");
const router = express.Router();
const { protect, isAdmin } = require("../middleware/authMiddleware");
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

// 👑 Admin-only user management
router.get("/", protect, isAdmin, getAllUsers);
router.get("/:id", protect, isAdmin, getUserById);
router.post("/", protect, isAdmin, createUser);
router.put("/:id", protect, isAdmin, updateUser);
router.delete("/:id", protect, isAdmin, deleteUser);

module.exports = router;
