const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");

const {
  generateQuiz,
  submitQuiz,
} = require("../controllers/quizController");

// ================= GENERATE AI QUIZ =================
// POST /api/quizzes/generate/:lectureId
router.post(
  "/generate/:lectureId",
  protect,
  generateQuiz
);

// ================= SUBMIT QUIZ =================
// POST /api/quizzes/submit/:quizId
router.post(
  "/submit/:quizId",
  protect,
  submitQuiz
);

module.exports = router;
