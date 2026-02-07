import Lecture from "../models/Lecture.js";
import { generateText } from "../utils/geminiService.js";

export const getLectureSummary = async (req, res) => {
  try {
    const { lectureId } = req.params;

    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    if (!lecture.isChunked || lecture.pdfChunks.length === 0) {
      return res
        .status(400)
        .json({ message: "Lecture content not ready for summary" });
    }

    // ✅ cache check
    if (lecture.isSummaryGenerated && lecture.summary) {
      return res.json({ summary: lecture.summary, cached: true });
    }

    // 🧠 hybrid chunks
    const total = lecture.pdfChunks.length;
    const chunksText = [
      lecture.pdfChunks[0],
      lecture.pdfChunks[Math.floor(total / 2)],
      lecture.pdfChunks[total - 1],
    ]
      .map(c => c.text)
      .join("\n\n");
    
      const prompt = `
You are an expert educator.

Create a SHORT, student-friendly summary of this lecture.

Rules:
- Maximum 120 words
- Use bullet points
- Cover only the most important ideas
- No unnecessary explanations

Lecture Content:
${chunksText}
`;

   
    const summary = await generateText(prompt);

    lecture.summary = summary;
    lecture.isSummaryGenerated = true;
    await lecture.save();

    res.json({ summary, cached: false });
  } catch (err) {
    console.error("Lecture summary error:", err);
    res.status(500).json({ message: "Failed to generate summary" });
  }
};
