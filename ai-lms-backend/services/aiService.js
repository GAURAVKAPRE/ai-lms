import { geminiModel} from "../utils/gemini.js";

/**
 * 🤖 Ask AI Tutor (course-restricted)
 */
const askQuestionFromContext = async ({ context, question }) => {
  if (!context || !question) {
    throw new Error("Context and question are required");
  }

  const prompt = `
You are an AI tutor.

Rules:
- Answer ONLY using the provided course material.
- If the answer is not present, say:
  "I don't know based on the given material."

Course Material:
${context}

Question:
${question}
`;

  const result = await geminiModel.generateContent(prompt);
  return result.response.text();
};

/**
 * 🧠 Generate Quiz from Lecture Text
 */
const generateQuizFromText = async (lectureText) => {
  if (!lectureText || lectureText.length < 100) {
    throw new Error("Insufficient lecture content for quiz generation");
  }

  const prompt = `
Generate exactly 5 multiple-choice questions from the content below.

Rules:
- Return ONLY valid JSON
- No markdown
- No explanations outside JSON
- Exactly 4 options per question
- correctAnswer must be a number between 0–3

JSON format:
[
  {
    "question": "string",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": 0,
    "explanation": "short explanation"
  }
]

Content:
${lectureText}
`;

  const result = await geminiFlash.generateContent(prompt);
  const raw = result.response.text();

  // 🔥 Gemini sometimes wraps JSON in ```json blocks
  const cleaned = raw.replace(/```json|```/g, "").trim();

  return JSON.parse(cleaned);
};

// ✅ NAMED EXPORTS
export { askQuestionFromContext, generateQuizFromText };
