const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect } = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// 🔹 Get all users (Admin only)
router.get("/users", protect, roleMiddleware("admin"), async (req, res) => {
  try {
    const users = await User.find().select("-password"); // exclude passwords
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 Delete a user (Admin only)
router.delete("/users/:id", protect, roleMiddleware("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.remove();
    res.json({ message: "User removed successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
