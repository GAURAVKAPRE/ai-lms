const express = require("express");
const router = express.Router();

const { register, login } = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");

// 🔐 Register a new user
router.post("/register", register);

// 🔐 Login user
router.post("/login", login);

// 👤 Get logged-in user info (JWT protected)
router.get("/me", protect, async (req, res) => {
  try {
    // req.user is populated by the protect middleware
    res.status(200).json(req.user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
