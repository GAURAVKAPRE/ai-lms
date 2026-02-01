import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import Lecture from "../models/Lecture.js";
import { askQuestionFromContext } from "../services/aiService.js";

const router = express.Router();

router.post("/ask", protect, async (req, res) => {
  try {
    const { courseId, question } = req.body;

    if (!courseId || !question) {
      return res
        .status(400)
        .json({ message: "courseId and question are required" });
    }

    const lectures = await Lecture.find({ course: courseId });

    let context = "";
    lectures.forEach((lec) => {
      if (lec.pdfText) {
        context += `Lecture: ${lec.title}\n${lec.pdfText}\n\n`;
      }
    });

    if (!context.trim()) {
      return res.json({
        answer: "No study material available for this course yet.",
      });
    }

    const answer = await askQuestionFromContext({ context, question });
    res.json({ answer });
  } catch (err) {
    console.error("AI ask error:", err);
    res.status(500).json({ message: "AI tutor failed" });
  }
});

export default router;
