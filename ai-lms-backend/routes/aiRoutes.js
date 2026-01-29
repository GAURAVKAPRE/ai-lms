const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const Lecture = require("../models/Lecture");
const openai = require("../utils/openai");

// 🔹 ASK AI (REAL OPENAI)
router.post("/ask", protect, async (req, res) => {
  try {
    const { courseId, question } = req.body;

    if (!question) {
      return res.status(400).json({ message: "Question is required" });
    }

    // 1️⃣ Collect course material
    const lectures = await Lecture.find({ course: courseId });

    let context = "";
    lectures.forEach((lec) => {
      if (lec.pdfText) {
        context += `Lecture: ${lec.title}\n${lec.pdfText}\n\n`;
      }
    });

    if (!context) {
      return res.json({
        answer: "No study material available for this course yet.",
      });
    }

    // 2️⃣ Ask OpenAI (context-restricted)
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an AI tutor. Answer ONLY using the provided course material. If the answer is not in the material, say you don't know.",
        },
        {
          role: "user",
          content: `Course Material:\n${context}\n\nQuestion: ${question}`,
        },
      ],
      temperature: 0.3,
    });

    // 3️⃣ Send AI answer
    res.json({
      answer: completion.choices[0].message.content,
    });
  } catch (err) {
    console.error("AI Error:", err.message);
    res.status(500).json({ message: "AI tutor failed" });
  }
});

module.exports = router;
