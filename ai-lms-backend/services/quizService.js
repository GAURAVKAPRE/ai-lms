import { geminiModel } from "../utils/gemini.js";

const generateQuizFromChunks = async (pdfChunks) => {
  if (!Array.isArray(pdfChunks) || pdfChunks.length === 0) {
    throw new Error("No chunks available for quiz generation");
  }

  // 🔒 MERGE ALL CHUNKS INTO ONE TEXT (SAFE SIZE)
  const combinedText = pdfChunks
    .map((c) => c.text)
    .join("\n\n")
    .slice(0, 6000); // VERY IMPORTANT (token safety)

  console.log("🧠 Sending ONE Gemini request");

  const prompt = `
You are an AI that generates quiz questions.

Use ONLY the study material below.

Generate exactly 5 multiple-choice questions.

RULES:
- Return ONLY valid JSON
- Each question must have 4 options
- correctAnswer must be an index (0–3)

JSON FORMAT:
[
  {
    "question": "string",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": 0,
    "explanation": "string"
  }
]

STUDY MATERIAL:
<<<
${combinedText}
>>>
`;

  const result = await geminiModel.generateContent(prompt);
  let rawText = result.response.text();

  rawText = rawText.replace(/```json|```/g, "").trim();

  const start = rawText.indexOf("[");
  const end = rawText.lastIndexOf("]") + 1;

  if (start === -1 || end === -1) {
    throw new Error("Invalid AI response");
  }

  const questions = JSON.parse(rawText.slice(start, end));

  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("Quiz could not be generated from this lecture content");
  }

  return questions;
};

export default generateQuizFromChunks;
