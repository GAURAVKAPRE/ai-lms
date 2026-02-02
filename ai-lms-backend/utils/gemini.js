import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY missing in .env");
}

if (!process.env.GEMINI_MODEL) {
  throw new Error("GEMINI_MODEL missing in .env");
}

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const geminiModel = {
  async generateContent(prompt) {
    const result = await genAI.models.generateContent({
      model: process.env.GEMINI_MODEL, // gemini-2.5-flash-lite
      contents: prompt,
    });

    return {
      response: {
        text: () => result.text,
      },
    };
  },
};
