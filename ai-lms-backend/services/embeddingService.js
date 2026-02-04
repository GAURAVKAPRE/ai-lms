import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const generateEmbedding = async (text) => {
  if (!text || typeof text !== "string") {
    throw new Error("Invalid text for embedding");
  }

  const result = await genAI.models.embedContent({
    model: "text-embedding-004",
    contents: [
      {
        role: "user",
        parts: [{ text }],
      },
    ],
  });

  // ✅ CORRECT RESPONSE SHAPE
  if (
    !result.embeddings ||
    !Array.isArray(result.embeddings) ||
    !result.embeddings[0]?.values
  ) {
    throw new Error("Invalid embedding response from Gemini");
  }

  return result.embeddings[0].values;
};
