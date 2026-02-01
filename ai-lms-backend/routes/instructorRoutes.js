import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import Course from "../models/Course.js";

const router = express.Router();

// ================= ENABLE INSTRUCTOR =================
router.post("/enable", protect, async (req, res) => {
  if (req.user.instructorProfile.enabled) {
    return res.status(400).json({ message: "Already an instructor" });
  }

  req.user.instructorProfile.enabled = true;
  await req.user.save();

  res.json({ instructorProfile: req.user.instructorProfile });
});

// ================= DISABLE INSTRUCTOR =================
router.post("/disable", protect, async (req, res) => {
  if (!req.user.instructorProfile.enabled) {
    return res.status(400).json({ message: "Not an instructor" });
  }

  req.user.instructorProfile.enabled = false;
  await req.user.save();

  res.json({ instructorProfile: req.user.instructorProfile });
});

// ================= CREATE COURSE (INSTRUCTOR ONLY) =================
router.post("/course", protect, async (req, res) => {
  if (!req.user.instructorProfile.enabled) {
    return res.status(403).json({ message: "Instructor access required" });
  }

  const { title, description } = req.body;

  if (!title || !description) {
    return res
      .status(400)
      .json({ message: "Title and description are required" });
  }

  const course = await Course.create({
    title,
    description,
    instructor: req.user._id,
  });

  req.user.instructorProfile.coursesCreated.push(course._id);
  await req.user.save();

  res.status(201).json(course);
});

export default router;
