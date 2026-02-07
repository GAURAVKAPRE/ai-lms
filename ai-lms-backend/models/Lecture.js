import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    videoUrl: {
      type: String, // S3 / Cloudinary video URL
    },

    pdfUrl: {
      type: String, // S3 / Cloudinary PDF URL
    },

    // 🔥 Extracted text from PDF (for AI, Quiz, Summary)
    pdfText: {
      type: String,
      default: "",
    },

    // ✅ tells if text extraction succeeded
    isTextExtracted: {
      type: Boolean,
      default: false,
    },

    // 🧩 AI-ready text chunks
    pdfChunks: [
      {
        index: {
          type: Number,
          required: true,
        },
        text: {
          type: String,
          required: true,
        },
        wordCount: {
          type: Number,
          required: true,
        },
      },
    ],

    // ✅ tells if chunking is completed
    isChunked: {
      type: Boolean,
      default: false,
    },

    // 📘 AI-generated lecture summary
    summary: {
      type: String,
      default: "",
    },

    // ✅ prevents duplicate AI summary generation
    isSummaryGenerated: {
      type: Boolean,
      default: false,
    },

    order: {
      type: Number,
      default: 0,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
  },
  { timestamps: true }
);

// ✅ Model
const Lecture = mongoose.model("Lecture", lectureSchema);

// ✅ Export
export default Lecture;
