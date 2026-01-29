const mongoose = require("mongoose");

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
      type: String, // Cloudinary video URL
    },

    pdfUrl: {
      type: String, // Cloudinary PDF URL
    },

    // 🔥 NEW: extracted text from PDF (for AI)
    pdfText: {
      type: String,
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

module.exports = mongoose.model("Lecture", lectureSchema);
