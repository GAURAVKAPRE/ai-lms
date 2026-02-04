import mongoose from "mongoose";

const lectureEmbeddingSchema = new mongoose.Schema(
  {
    lectureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecture",
      required: true,
      index: true,
    },

    chunkIndex: {
      type: Number,
      required: true,
    },

    chunkText: {
      type: String,
      required: true,
    },

    embedding: {
      type: [Number], // vector
      required: true,
    },
  },
  { timestamps: true }
);

// 🔑 prevent duplicate embeddings
lectureEmbeddingSchema.index(
  { lectureId: 1, chunkIndex: 1 },
  { unique: true }
);

const LectureEmbedding = mongoose.model(
  "LectureEmbedding",
  lectureEmbeddingSchema
);

export default LectureEmbedding;
