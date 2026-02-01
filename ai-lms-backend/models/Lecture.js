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

    // 🔥 Extracted text from PDF (for AI & Quiz)
    pdfText: {
      type: String,
      default: "",
    },

    // ✅ tells if text extraction succeeded
    isTextExtracted: {
      type: Boolean,
      default: false,
    },

    // 🧩 NEW: AI-ready text chunks
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

    // ✅ NEW: tells if chunking is completed
    isChunked: {
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

// ✅ CORRECT model creation
const Lecture = mongoose.model("Lecture", lectureSchema);

// ✅ CORRECT export
export default Lecture;
