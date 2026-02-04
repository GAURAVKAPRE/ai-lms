import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import Lecture from "../models/Lecture.js";
import LectureEmbedding from "../models/LectureEmbedding.js";
import { ensureLectureEmbeddings } from "../services/lectureEmbeddingService.js";
import { generateEmbedding } from "../services/embeddingService.js";
import { geminiModel } from "../utils/gemini.js";

const router = express.Router();

/**
 * 🧪 TEMP ROUTE — CREATE EMBEDDINGS FOR A LECTURE
 * POST /api/ai/debug/embed/:lectureId
 * (Call ONCE per lecture, remove later)
 */
router.post(
  "/debug/embed/:lectureId",
  protect,
  async (req, res) => {
    try {
      const { lectureId } = req.params;

      await ensureLectureEmbeddings(lectureId);

      res.json({
        message: "Lecture embeddings created successfully",
      });
    } catch (error) {
      console.error("Embedding debug error:", error);
      res.status(500).json({ message: "Embedding creation failed" });
    }
  }
);

/**
 * 🧠 ASK AI — LECTURE-WISE RAG
 * POST /api/ai/ask/:lectureId
 */
router.post("/ask/:lectureId", protect, async (req, res) => {
  try {
    const { lectureId } = req.params;
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ message: "Question is required" });
    }

    // 1️⃣ Validate lecture
    const lecture = await Lecture.findById(lectureId);
    if (!lecture || !lecture.isChunked) {
      return res
        .status(400)
        .json({ message: "Lecture not ready for AI" });
    }

    // 2️⃣ Ensure embeddings exist (cache-first)
    await ensureLectureEmbeddings(lectureId);

    // 3️⃣ Embed user question
    const questionEmbedding = await generateEmbedding(question);

    // 4️⃣ Vector search (semantic retrieval)
    const results = await LectureEmbedding.aggregate([
        {
    $vectorSearch: {
      index: "lecture_embedding_vector_index",
      path: "embedding",
      queryVector: questionEmbedding,
      numCandidates: 100,
      limit: 5,
    },
  },
  {
    $project: {
      chunkText: 1,
      score: { $meta: "vectorSearchScore" },
    },
  },
    ]);

    if (!results.length) {
      return res.json({
        answer: "I don't know based on the given lecture material.",
      });
    }

    // 5️⃣ Build context from top chunks
    const context = results
      .map((r, i) => `Chunk ${i + 1}:\n${r.chunkText}`)
      .join("\n\n");

      console.log(
  "🔎 Retrieved chunks:",
  results.map(r => r.chunkText)
);


    // 6️⃣ Ask Gemini (grounded)
    const prompt = `
You are an AI tutor.

Rules:
- Answer ONLY using the provided lecture content.
- If the answer is not present, say:
  "I don't know based on the given lecture material."

Lecture Content:
${context}

Question:
${question}
`;

    const result = await geminiModel.generateContent(prompt);

    res.json({
      answer: result.response.text(),
    });
  } catch (error) {
    console.error("Ask AI error:", error);
    res.status(500).json({ message: "Ask AI failed" });
  }
});

export default router;
