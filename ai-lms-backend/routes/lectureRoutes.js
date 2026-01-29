const express = require("express");
const router = express.Router();

const {
  createLecture,
  getLecturesByCourse,
  updateLecture,
  deleteLecture,
} = require("../controllers/lectureController");

const { protect } = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// ✅ AWS S3 upload middleware
const upload = require("../middlewares/upload");

/*
====================================================
LECTURE ROUTES (AWS S3 BASED)
====================================================
*/

// ================= CREATE LECTURE =================
// Instructor adds lecture with VIDEO + PDF
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
// Instructor (owner) OR Student (enrolled)
// GET /api/courses/:courseId/lectures
router.get(
  "/courses/:courseId/lectures",
  protect,
  getLecturesByCourse
);

// ================= UPDATE LECTURE =================
// Instructor (owner only)
// PUT /api/lectures/:id
router.put(
  "/lectures/:id",
  protect,
  roleMiddleware("instructor"),
  updateLecture
);

// ================= DELETE LECTURE =================
// Instructor (owner only)
// DELETE /api/lectures/:id
router.delete(
  "/lectures/:id",
  protect,
  roleMiddleware("instructor"),
  deleteLecture
);

module.exports = router;
