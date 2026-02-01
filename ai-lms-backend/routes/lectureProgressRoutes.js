import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  updateLectureProgress,
  getProgressByCourse,
} from "../controllers/lectureProgressController.js";

const router = express.Router();

// ================= UPDATE PROGRESS =================
// POST /api/progress/:lectureId
router.post("/:lectureId", protect, updateLectureProgress);

// ================= GET PROGRESS BY COURSE =================
// GET /api/progress/course/:courseId
router.get("/course/:courseId", protect, getProgressByCourse);

export default router;
