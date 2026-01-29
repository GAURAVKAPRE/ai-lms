const Quiz = require("../models/Quiz");
const QuizAttempt = require("../models/QuizAttempt");
const Lecture = require("../models/Lecture");
const openai = require("../utils/openai");

// ================= GENERATE QUIZ (AI) =================
exports.generateQuiz = async (req, res) => {
  try {
    const { lectureId } = req.params;

    // 1️⃣ Check lecture
    const lecture = await Lecture.findById(lectureId);
    if (!lecture || !lecture.pdfText || !lecture.pdfText.trim()) {
      return res.status(400).json({
        message: "Lecture PDF text not available for quiz generation",
      });
    }

    // 2️⃣ Reuse quiz if already exists
    let quiz = await Quiz.findOne({ lecture: lectureId });
    if (quiz) {
      return res.status(200).json({ quiz });
    }

    // 3️⃣ Ask AI to generate quiz
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Generate exactly 5 multiple-choice questions from the lecture content.

Rules:
- Return ONLY valid JSON
- Each question must have exactly 4 options
- correctAnswer must be a number between 0 and 3

JSON format:
[
  {
    "question": "string",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": 0,
    "explanation": "short explanation"
  }
]
          `,
        },
        {
          role: "user",
          content: lecture.pdfText,
        },
      ],
      temperature: 0.3,
    });

    // 4️⃣ Safe JSON parsing with validation
    let questions;
    try {
      questions = JSON.parse(
        completion.choices[0].message.content
      );
    } catch (err) {
      return res.status(500).json({
        message: "AI returned invalid JSON format",
      });
    }

    if (
      !Array.isArray(questions) ||
      questions.length === 0 ||
      !questions.every(
        (q) =>
          q.question &&
          Array.isArray(q.options) &&
          q.options.length === 4 &&
          typeof q.correctAnswer === "number"
      )
    ) {
      return res.status(500).json({
        message: "AI returned invalid question structure",
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
exports.submitQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body;

    if (!quizId || !Array.isArray(answers)) {
      return res.status(400).json({ message: "Invalid submission" });
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
        explanation: q.explanation || "No explanation available",
      });
    });

    // 6️⃣ Save quiz attempt
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
  } catch (err) {
    console.error("Quiz submission error:", err);
    res.status(500).json({ message: "Quiz submission failed" });
  }
};
