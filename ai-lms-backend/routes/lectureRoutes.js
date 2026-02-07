import express from "express";

import {
  createLecture,
  getLecturesByCourse,
  updateLecture,
  deleteLecture,
} from "../controllers/lectureController.js";

import { getLectureSummary } from "../controllers/lectureSummaryController.js";

import { protect } from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

/*
====================================================
LECTURE ROUTES (AWS S3 BASED)
====================================================
*/

// ================= CREATE LECTURE =================
// POST /api/courses/:courseId/lectures
router.post(
  "/courses/:courseId/lectures",
  protect,
  roleMiddleware("instructor"),
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "pdf", maxCount: 1 },
  ]),
  createLecture
);

// ================= GET LECTURES BY COURSE =================
// GET /api/courses/:courseId/lectures
router.get(
  "/courses/:courseId/lectures",
  protect,
  getLecturesByCourse
);

// ================= UPDATE LECTURE =================
// PUT /api/lectures/:id
router.put(
  "/lectures/:id",
  protect,
  roleMiddleware("instructor"),
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "pdf", maxCount: 1 },
  ]),
  updateLecture
);

// ================= DELETE LECTURE =================
// DELETE /api/lectures/:id
router.delete(
  "/lectures/:id",
  protect,
  roleMiddleware("instructor"),
  deleteLecture
);

// ================= 🧠 LECTURE SUMMARY =================
// GET /api/lectures/:lectureId/summary
router.get(
  "/lectures/:lectureId/summary",
  protect,
  getLectureSummary
);

export default router;
