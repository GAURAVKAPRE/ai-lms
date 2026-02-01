import Quiz from "../models/Quiz.js";
import QuizAttempt from "../models/QuizAttempt.js";
import Lecture from "../models/Lecture.js";

// ✅ Gemini AI service
import { generateQuizFromText } from "../services/aiService.js";

// ================= GENERATE QUIZ =================
const generateQuiz = async (req, res) => {
  try {
    const { lectureId } = req.params;

    // 1️⃣ Fetch lecture
    const lecture = await Lecture.findById(lectureId);
    if (!lecture || !lecture.pdfText || !lecture.pdfText.trim()) {
      return res.status(400).json({
        message: "Lecture PDF text not available for quiz generation",
      });
    }

    // 2️⃣ Reuse existing quiz
    let quiz = await Quiz.findOne({ lecture: lectureId });
    if (quiz) {
      return res.status(200).json({ quiz });
    }

    // 3️⃣ Generate quiz using Gemini
    const aiResponse = await generateQuizFromText(lecture.pdfText);

    let questions;
    try {
      questions = JSON.parse(aiResponse);
    } catch (err) {
      return res.status(500).json({
        message: "AI returned invalid JSON",
      });
    }

    // 4️⃣ Validate structure
    if (
      !Array.isArray(questions) ||
      !questions.every(
        (q) =>
          q.question &&
          Array.isArray(q.options) &&
          q.options.length === 4 &&
          typeof q.correctAnswer === "number"
      )
    ) {
      return res.status(500).json({
        message: "Invalid quiz structure from AI",
      });
    }

    // 5️⃣ Save quiz
    quiz = await Quiz.create({
      course: lecture.course,
      lecture: lectureId,
      questions,
    });

    res.status(201).json({ quiz });
  } catch (error) {
    console.error("Generate quiz error:", error);
    res.status(500).json({ message: "Failed to generate quiz" });
  }
};

// ================= SUBMIT QUIZ =================
const submitQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body;

    if (!Array.isArray(answers)) {
      return res.status(400).json({ message: "Invalid answers format" });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    let score = 0;
    const results = [];

    quiz.questions.forEach((q, index) => {
      const userAnswer = answers.find(
        (a) => a.questionIndex === index
      );

      const isCorrect =
        userAnswer &&
        userAnswer.selectedOption === q.correctAnswer;

      if (isCorrect) score++;

      results.push({
        question: q.question,
        correctAnswer: q.correctAnswer,
        selectedOption: userAnswer?.selectedOption ?? null,
        isCorrect,
        explanation: q.explanation || "",
      });
    });

    // Save attempt
    await QuizAttempt.create({
      quiz: quiz._id,
      user: req.user._id,
      answers,
      score,
      totalQuestions: quiz.questions.length,
    });

    res.json({
      totalQuestions: quiz.questions.length,
      score,
      results,
    });
  } catch (error) {
    console.error("Submit quiz error:", error);
    res.status(500).json({ message: "Quiz submission failed" });
  }
};

// ================= GET QUIZ BY ID =================
const getQuizById = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.status(200).json(quiz);
  } catch (error) {
    console.error("Get quiz error:", error);
    res.status(500).json({ message: "Failed to fetch quiz" });
  }
};


// ✅ IMPORTANT: named exports
export { generateQuiz, submitQuiz, getQuizById };
