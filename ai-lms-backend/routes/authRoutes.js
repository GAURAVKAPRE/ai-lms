import express from "express";
import {
  register,
  login,
} from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router(); // ✅ THIS WAS MISSING

// 🔐 Register a new user
router.post("/register", register);

// 🔐 Login user
router.post("/login", login);

// 👤 Get logged-in user info (JWT protected)
router.get("/me", protect, async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
