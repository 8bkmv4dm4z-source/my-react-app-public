const Workshop = require("../models/Workshop");

/**
 * ============================================================
 * Workshop Controller
 * ============================================================
 * Handles all workshop CRUD and participant management logic.
 * - Supports admin-only management of participant lists.
 * - Keeps backward compatibility with /register and /unregister routes.
 * - All responses include populated participants for client sync.
 */

/* ------------------------------------------------------------
   🟢 GET /api/workshops
   Fetch all workshops (with optional filters & search)
------------------------------------------------------------ */
exports.getAllWorkshops = async (req, res) => {
  try {
    const { q, field, ...others } = req.query;
    const filter = {};

    // Search handling
    if (q) {
      const allowed = [
        "title", "type", "ageGroup", "city",
        "coach", "day", "hour", "description"
      ];
      const searchRegex = new RegExp(String(q), "i");
      if (field && allowed.includes(field) && field !== "all") {
        filter[field] = { $regex: searchRegex };
      } else {
        filter.$or = allowed.map((f) => ({ [f]: { $regex: searchRegex } }));
      }
    }

    // Basic filters
    const whitelist = [
      "type", "ageGroup", "city", "coach", "day", "hour", "available"
    ];
    Object.entries(others).forEach(([k, v]) => {
      if (whitelist.includes(k) && v !== "") {
        filter[k] = k === "available" ? String(v).toLowerCase() === "true" : v;
      }
    });

    const workshops = await Workshop.find(filter).populate("participants", "name email");
    res.json(workshops);
  } catch (err) {
    console.error("❌ Error fetching workshops:", err);
    res.status(500).json({ message: "Server error fetching workshops" });
  }
};

/* ------------------------------------------------------------
   🟢 GET /api/workshops/my
   Return workshops the authenticated user is registered for
------------------------------------------------------------ */
exports.getMyWorkshops = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const workshops = await Workshop.find({ participants: userId })
      .populate("participants", "name email");
    res.json(workshops);
  } catch (err) {
    console.error("❌ Error fetching my workshops:", err);
    res.status(500).json({ message: "Server error fetching my workshops" });
  }
};

/* ------------------------------------------------------------
   🟢 GET /api/workshops/:id
------------------------------------------------------------ */
exports.getWorkshopById = async (req, res) => {
  try {
    const ws = await Workshop.findById(req.params.id).populate("participants", "name email");
    if (!ws) return res.status(404).json({ message: "Workshop not found" });
    res.json(ws);
  } catch {
    res.status(400).json({ message: "Invalid workshop ID" });
  }
};

/* ------------------------------------------------------------
   🟡 POST /api/workshops
   Create a new workshop (Admin)
------------------------------------------------------------ */
exports.createWorkshop = async (req, res) => {
  try {
    const ws = await Workshop.create(req.body);
    res.status(201).json(ws);
  } catch (err) {
    console.error("❌ Error creating workshop:", err);
    res.status(400).json({ message: err.message });
  }
};

/* ------------------------------------------------------------
   🟠 PUT /api/workshops/:id
   Update workshop (Admin)
------------------------------------------------------------ */
exports.updateWorkshop = async (req, res) => {
  try {
    const existing = await Workshop.findById(req.params.id);
    if (!existing)
      return res.status(404).json({ message: "Workshop not found" });

    // ✅ נעדכן רק שדות שמותר לעדכן
    const allowedFields = [
      "title",
      "type",
      "ageGroup",
      "city",
      "studio",
      "coach",
      "day",
      "hour",
      "available",
      "description",
      "price",
      "image",
      "maxParticipants"
    ];

    const updateData = {};
    for (const key of allowedFields) {
      if (key in req.body) updateData[key] = req.body[key];
    }

    // ✅ שומרים את המשתתפים הקיימים תמיד
    updateData.participants = existing.participants;
    updateData.participantsCount = existing.participants.length;

    const ws = await Workshop.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate("participants", "name email");

    res.json({
      message: "Workshop updated successfully",
      workshop: ws,
    });
  } catch (err) {
    console.error("❌ Error updating workshop:", err);
    res.status(400).json({ message: "Failed to update workshop" });
  }
};



/* ------------------------------------------------------------
   🔴 DELETE /api/workshops/:id
   Delete a workshop (Admin)
------------------------------------------------------------ */
exports.deleteWorkshop = async (req, res) => {
  try {
    const ws = await Workshop.findByIdAndDelete(req.params.id);
    if (!ws) return res.status(404).json({ message: "Workshop not found" });
    res.json({ message: "Workshop deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting workshop:", err);
    res.status(400).json({ message: "Failed to delete workshop" });
  }
};

/* ============================================================
   🟢 Registration (Backward Compatibility)
   ============================================================ */

/**
 * POST /api/workshops/:id/register
 * Adds the authenticated user to participants.
 */
exports.registerForWorkshop = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) return res.status(404).json({ message: "Workshop not found" });

    const userId = req.user._id;

    if (workshop.participants.includes(userId))
      return res.status(400).json({ message: "User already registered" });

    if (
      workshop.maxParticipants > 0 &&
      workshop.participants.length >= workshop.maxParticipants
    )
      return res.status(400).json({ message: "Workshop is full" });

    workshop.participants.push(userId);
    workshop.participantsCount = workshop.participants.length;
    await workshop.save();

    const updated = await Workshop.findById(workshop._id).populate("participants", "name email");
    res.status(201).json({ message: "Registered successfully", workshop: updated });
  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
};
exports.getRegisteredWorkshopIds = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const workshops = await Workshop.find({ participants: userId }).select("_id");
    const ids = workshops.map((w) => w._id.toString());
    res.json(ids);
  } catch (err) {
    console.error("❌ Error fetching registered workshop IDs:", err);
    res.status(500).json({ message: "Server error fetching registered workshops" });
  }
};

/**
 * POST /api/workshops/:id/unregister
 * Removes the authenticated user from participants.
 */
/**
 * POST /api/workshops/:id/unregister
 * Removes the authenticated user from participants.
 */
exports.unregisterFromWorkshop = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) return res.status(404).json({ message: "Workshop not found" });

    const userId = req.user._id;

    // אם המשתמש כלל לא רשום, נחזיר הודעה מתאימה
    if (!workshop.participants.some((id) => id.toString() === userId.toString())) {
      return res.status(400).json({ message: "User not registered for this workshop" });
    }

    // הסרה ועדכון מונה
    workshop.participants = workshop.participants.filter(
      (id) => id.toString() !== userId.toString()
    );
    workshop.participantsCount = workshop.participants.length;
    await workshop.save();

    const updated = await Workshop.findById(workshop._id)
      .populate("participants", "name email");
    res.json({ message: "Unregistered successfully", workshop: updated });
  } catch (err) {
    console.error("❌ Unregister error:", err);
    res.status(500).json({ message: "Server error during unregistration" });
  }
};

/**
 * PUT /api/workshops/:id/capacity
 * Updates the maxParticipants (admin only)
 */
exports.updateWorkshopCapacity = async (req, res) => {
  try {
    const { id } = req.params;
    const { maxParticipants } = req.body;

    if (typeof maxParticipants !== "number" || maxParticipants < 0) {
      return res.status(400).json({ message: "maxParticipants must be a positive number" });
    }

    const workshop = await Workshop.findById(id);
    if (!workshop) return res.status(404).json({ message: "Workshop not found" });

    workshop.maxParticipants = maxParticipants;

    // אם יש יותר משתתפים מהגבול החדש, לא נמחק אוטומטית — רק אזהרה
    if (workshop.participants.length > maxParticipants && maxParticipants > 0) {
      console.warn(`⚠️ Workshop ${id} has more participants than allowed (${workshop.participants.length}/${maxParticipants})`);
    }

    await workshop.save();
    res.json({ message: "Capacity updated successfully", workshop });
  } catch (err) {
    console.error("❌ Error updating capacity:", err);
    res.status(500).json({ message: "Server error updating capacity" });
  }
};


/* ============================================================
   🧩 New API — Unified Naming & Permissions
   ============================================================ */

/**
 * POST /api/workshops/:id/user_array
 * Add user to workshop (self or admin adding someone else)
 */
exports.addUserToWorkshop = async (req, res) => {
  try {
    const { id } = req.params;
    const targetUserId = req.body.userId || req.user._id;

    const workshop = await Workshop.findById(id);
    if (!workshop) return res.status(404).json({ message: "Workshop not found" });

    // Prevent duplicates
    if (workshop.participants.includes(targetUserId))
      return res.status(400).json({ message: "User already registered" });

    // Capacity check
    if (
      workshop.maxParticipants > 0 &&
      workshop.participants.length >= workshop.maxParticipants
    )
      return res.status(400).json({ message: "Workshop is full" });

    workshop.participants.push(targetUserId);
    workshop.participantsCount = workshop.participants.length;
    await workshop.save();

    const updated = await Workshop.findById(id).populate("participants", "name email");
    res.status(201).json({ message: "User added to workshop", workshop: updated });
  } catch (err) {
    console.error("❌ addUserToWorkshop error:", err);
    res.status(500).json({ message: "Failed to add user to workshop" });
  }
};

/**
 * DELETE /api/workshops/:id/user_array/:userId
 * Remove specific user from workshop
 * - Admin can remove any user
 * - Regular user can remove only themselves
 */
exports.removeUserFromWorkshop = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const workshop = await Workshop.findById(id);
    if (!workshop) return res.status(404).json({ message: "Workshop not found" });

    // Authorization: user can only remove themselves unless admin
    if (req.user.role !== "admin" && req.user._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized to remove this user" });
    }

    workshop.participants = workshop.participants.filter(
      (u) => u.toString() !== userId.toString()
    );
    workshop.participantsCount = workshop.participants.length;
    await workshop.save();

    const updated = await Workshop.findById(id).populate("participants", "name email");
    res.json({ message: "User removed from workshop", workshop: updated });
  } catch (err) {
    console.error("❌ removeUserFromWorkshop error:", err);
    res.status(500).json({ message: "Failed to remove user" });
  }
};

/**
 * PUT /api/workshops/:id/users_array
 * Replace the entire participants array (Admin only)
 */
/**
 * PUT /api/workshops/:id/users_array
 * Replace the entire participants array (Admin only)
 * -------------------------------------------------------
 * - Used by admin to fully replace the participants list.
 * - Automatically updates participantsCount.
 * - Returns the full updated workshop object for client sync.
 */
exports.updateParticipantsArray = async (req, res) => {
  try {
    const { id } = req.params;
    const { participants } = req.body;

    // ✅ Validation
    if (!Array.isArray(participants)) {
      return res.status(400).json({ message: "participants must be an array" });
    }

    const workshop = await Workshop.findById(id);
    if (!workshop) {
      return res.status(404).json({ message: "Workshop not found" });
    }

    // 🧠 Update participants + recalc count
    workshop.participants = participants;
    workshop.participantsCount = participants.length;

    await workshop.save();

    const updated = await Workshop.findById(id).populate("participants", "name email");

    // ✅ Consistent JSON format with other endpoints
    res.json({
      message: "Participants updated successfully",
      workshop: updated,
    });
  } catch (err) {
    console.error("❌ updateParticipantsArray error:", err);
    res.status(500).json({ message: "Failed to update participants" });
  }
};


/**
 * GET /api/workshops/:id/participants
 *
 * Returns the list of participants for a given workshop.  This endpoint
 * is primarily consumed by the client-side `WorkshopParticipantsModal`.  It
 * populates the `participants` reference and returns only the array of
 * participant objects instead of the entire workshop.  An authentication
 * check is performed in the route layer; admins can view any workshop's
 * participants, while regular users will typically only request their own.
 */
exports.getWorkshopParticipants = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id).populate(
      "participants",
      "name email"
    );
    if (!workshop) {
      return res.status(404).json({ message: "Workshop not found" });
    }
    // Return only the participants array for convenience on the client
    res.json(workshop.participants);
  } catch (err) {
    console.error("❌ Error fetching participants:", err);
    res.status(500).json({ message: "Server error fetching participants" });
  }
};
