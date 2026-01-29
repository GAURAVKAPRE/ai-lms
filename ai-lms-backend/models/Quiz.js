const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    lecture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecture",
      required: true,
      unique: true, // 🔥 one quiz per lecture
    },

    questions: [
      {
        question: {
          type: String,
          required: true,
        },

        options: {
          type: [String],
          required: true,
          validate: {
            validator: (v) => v.length === 4,
            message: "Each question must have exactly 4 options",
          },
        },

        correctAnswer: {
          type: Number, // index (0–3)
          required: true,
          min: 0,
          max: 3,
        },

        explanation: {
          type: String, // 🔥 AI feedback
          default: "",
        },
      },
    ],
  },
  { timestamps: true }
);

// 🔒 Extra safety (DB-level)
quizSchema.index({ lecture: 1 }, { unique: true });

module.exports = mongoose.model("Quiz", quizSchema);
