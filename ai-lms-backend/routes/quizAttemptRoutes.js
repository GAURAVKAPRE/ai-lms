import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import Quiz from "../models/Quiz.js";
import QuizAttempt from "../models/QuizAttempt.js";

const router = express.Router();


// 🔹 Submit quiz
router.post("/submit/:quizId", protect, async (req, res) => {
  try {
    const { answers } = req.body;

    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    let score = 0;

    quiz.questions.forEach((q, index) => {
      const userAnswer = answers.find(
        (a) => a.questionIndex === index
      );
      if (
        userAnswer &&
        userAnswer.selectedOption === q.correctAnswer
      ) {
        score++;
      }
    });

    const attempt = await QuizAttempt.create({
      quiz: quiz._id,
      user: req.user._id,
      answers,
      score,
      totalQuestions: quiz.questions.length,
    });

    res.json({
      score,
      totalQuestions: quiz.questions.length,
      attempt,
    });
  } catch (err) {
    console.error("Quiz submit error:", err.message);
    res.status(500).json({ message: "Quiz submission failed" });
  }
});


export default router;