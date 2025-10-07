// server/controllers/userController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// 🟢 Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-passwordHash -otpCode -otpAttempts");
    res.json(users);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ message: "Server error fetching users" });
  }
};

// 🟢 Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-passwordHash -otpCode -otpAttempts");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("❌ Error fetching user:", err);
    res.status(500).json({ message: "Server error fetching user" });
  }
};

// 🟢 Create user
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, city, phone, birthDate, canCharge } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const user = new User({ name, email, role, city, phone, birthDate, canCharge });

    if (password) await user.setPassword(password);
    await user.save();

    res.status(201).json({ message: "User created successfully", user });
  } catch (err) {
    console.error("❌ Error creating user:", err);
    res.status(500).json({ message: "Server error creating user" });
  }
};

// 🟢 Update user
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const requester = req.user; // assuming protect middleware attaches req.user

    // 🔒 Allow only admins or self-update
    if (!requester || (requester.role !== "admin" && requester._id.toString() !== userId)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { password, email, ...updates } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ Prevent duplicate email conflicts
    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email;
    }

    // ✅ Password update if provided
    if (password && password.trim() !== "") {
      await user.setPassword(password);
    }

    // ✅ Safe updatable fields
    const allowedFields = [
      "name",
      "idNumber",
      "birthDate",
      "phone",
      "city",
      "canCharge",
      "role",
      "familyMembers",
    ];

    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        user[key] = updates[key];
      }
    }

    await user.save();

    const cleanUser = user.toObject();
    delete cleanUser.passwordHash;
    delete cleanUser.otpCode;
    delete cleanUser.otpAttempts;

    res.json({
      message: "User updated successfully",
      user: cleanUser,
    });
  } catch (err) {
    console.error("❌ Error updating user:", err);
    res.status(500).json({ message: "Server error updating user" });
  }
};

// 🟢 Delete user
exports.deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting user:", err);
    res.status(500).json({ message: "Server error deleting user" });
  }
};
