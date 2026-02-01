import express from "express";
import { protect } from "../middlewares/authMiddleware.js";

import {
  generateQuiz,
  submitQuiz,
  getQuizById,
} from "../controllers/quizController.js";

const router = express.Router();

// ================= GENERATE AI QUIZ =================
// POST /api/quizzes/generate/:lectureId
router.post(
  "/generate/:lectureId",
  protect,
  generateQuiz
);

// ================= GET QUIZ BY ID =================
// GET /api/quizzes/:quizId
router.get(
  "/:quizId",
  protect,
  getQuizById
);

// ================= SUBMIT QUIZ =================
// POST /api/quizzes/submit/:quizId
router.post(
  "/submit/:quizId",
  protect,
  submitQuiz
);

export default router;
