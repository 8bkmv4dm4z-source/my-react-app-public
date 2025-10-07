const express = require("express");
const router = express.Router();
const { authenticate, authorizeAdmin } = require("../middleware/authMiddleware");
const { getUserProfile } = require("../controllers/authController");
const {
  getAllProfiles,
  deleteProfile,
  updateProfile,
} = require("../controllers/userController");

// GET /api/profile -> current user's profile
router.get("/", authenticate, getUserProfile);

// PUT /api/profile/edit -> edit current user's profile
router.put("/edit", authenticate, async (req, res, next) => {
  try {
    // Reuse profileController.updateProfile by injecting current user's id
    req.params.id = req.user._id.toString();
    return updateProfile(req, res, next);
  } catch (e) {
    console.error("profile/edit error:", e);
    res.status(500).json({ message: "Server error updating profile" });
  }
});

// GET /api/profile/all -> admin only
router.get("/all", authenticate, authorizeAdmin, getAllProfiles);

// DELETE /api/profile/:id -> admin delete
router.delete("/:id", authenticate, authorizeAdmin, deleteProfile);

module.exports = router;
