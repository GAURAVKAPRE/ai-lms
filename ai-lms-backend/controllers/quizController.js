import Quiz from "../models/Quiz.js";
import QuizAttempt from "../models/QuizAttempt.js";
import Lecture from "../models/Lecture.js";
import generateQuizFromChunks from "../services/quizService.js";

// ================= GENERATE QUIZ =================
// POST /api/quizzes/generate/:lectureId
const generateQuiz = async (req, res) => {
  const lectureId = req.params.lectureId?.trim();

  console.log("🧠 Generate quiz request for lecture:", lectureId);

  try {
    // 1️⃣ Validate lectureId
    if (!lectureId) {
      return res.status(400).json({ message: "Lecture ID is required" });
    }

    // 2️⃣ Fetch lecture
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    // 3️⃣ Ensure lecture is AI-ready
    if (!lecture.isTextExtracted || !lecture.isChunked) {
      return res.status(400).json({
        message: "Lecture is not ready for quiz generation",
      });
    }

    // 4️⃣ RETURN EXISTING QUIZ (CRITICAL)
    const existingQuiz = await Quiz.findOne({ lecture: lectureId });
    if (existingQuiz) {
      console.log("✅ Existing quiz found, returning cached quiz");
      return res.status(200).json(existingQuiz);
    }

    // 5️⃣ Generate quiz questions (Gemini)
    console.log(
      `🧠 Generating quiz from ${lecture.pdfChunks.length} chunks`
    );

    const questions = await generateQuizFromChunks(lecture.pdfChunks);

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        message:
          "Quiz could not be generated from this lecture content. Try a different PDF.",
      });
    }

    // 6️⃣ ATOMIC CREATE (race-condition safe)
    const quiz = await Quiz.findOneAndUpdate(
      { lecture: lecture._id }, // filter
      {
        $setOnInsert: {
          course: lecture.course,
          lecture: lecture._id,
          questions,
        },
      },
      {
        new: true,
        upsert: true, // 🔥 only one quiz ever created
      }
    );

    console.log("✅ Quiz created / fetched successfully");

    return res.status(201).json(quiz);
  } catch (error) {
    console.error("❌ Generate quiz error:", error);

    return res.status(500).json({
      message: "Failed to generate quiz",
    });
  }
};

// ================= SUBMIT QUIZ =================
// POST /api/quizzes/submit/:quizId
const submitQuiz = async (req, res) => {
  try {
    const quizId = req.params.quizId?.trim();
    const { answers = [] } = req.body;

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

      const selectedOption =
        userAnswer?.selectedOption ?? null;

      const isCorrect =
        selectedOption === q.correctAnswer;

      if (isCorrect) score++;

      results.push({
        question: q.question,
        selectedOption,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation || "",
      });
    });

    await QuizAttempt.create({
      quiz: quiz._id,
      user: req.user._id,
      answers,
      score,
      totalQuestions: quiz.questions.length,
    });

    return res.json({
      score,
      totalQuestions: quiz.questions.length,
      results,
    });
  } catch (error) {
    console.error("❌ Submit quiz error:", error.message);
    return res
      .status(500)
      .json({ message: "Quiz submission failed" });
  }
};

// ================= GET QUIZ BY ID =================
// GET /api/quizzes/:quizId
const getQuizById = async (req, res) => {
  try {
    const quizId = req.params.quizId?.trim();

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    return res.json(quiz);
  } catch (error) {
    console.error("❌ Get quiz error:", error.message);
    return res
      .status(500)
      .json({ message: "Failed to fetch quiz" });
  }
};

export { generateQuiz, submitQuiz, getQuizById };
