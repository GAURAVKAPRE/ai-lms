import Lecture from "../models/Lecture.js";
import LectureEmbedding from "../models/LectureEmbedding.js";
import { generateEmbedding } from "./embeddingService.js";

/**
 * Ensure embeddings exist for a lecture (cache-first)
 */
export const ensureLectureEmbeddings = async (lectureId) => {
  // 1️⃣ Check if embeddings already exist
  const existingCount = await LectureEmbedding.countDocuments({
    lectureId,
  });

  if (existingCount > 0) {
    console.log("✅ Embeddings already exist, skipping generation");
    return;
  }

  // 2️⃣ Fetch lecture
  const lecture = await Lecture.findById(lectureId);

  if (!lecture || !lecture.isChunked) {
    throw new Error("Lecture not ready for embeddings");
  }

  console.log(
    `🧠 Generating embeddings for ${lecture.pdfChunks.length} chunks`
  );

  // 3️⃣ Generate & store embeddings
  for (const chunk of lecture.pdfChunks) {
    const vector = await generateEmbedding(chunk.text);

    await LectureEmbedding.create({
      lectureId: lecture._id,
      chunkIndex: chunk.index,
      chunkText: chunk.text,
      embedding: vector,
    });
  }

  console.log("✅ Lecture embeddings stored successfully");
};
