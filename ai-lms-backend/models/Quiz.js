import mongoose from  "mongoose";

const quizSchema = new mongoose.Schema(
  {
    // 🔗 Course reference (for analytics / access control)
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    // 🔗 One quiz per lecture (VERY IMPORTANT)
    lecture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecture",
      required: true,
      unique: true, // 🔥 ensures one quiz per lecture
    },

    // 🧠 AI-generated questions
    questions: [
      {
        question: {
          type: String,
          required: true,
          trim: true,
        },

        options: {
          type: [String],
          required: true,
          validate: {
            validator: (v) => Array.isArray(v) && v.length === 4,
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
          type: String, // 🔥 AI explanation for learning
          default: "",
          trim: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// 🔒 Extra DB-level safety (prevents duplicate quizzes)
quizSchema.index({ lecture: 1 }, { unique: true });

export default mongoose.model("Quiz", quizSchema);

