import mongoose from  "mongoose";
const quizAttemptSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    answers: [
      {
        questionIndex: Number,
        selectedOption: Number,
      },
    ],

    score: {
      type: Number,
      default: 0,
    },

    totalQuestions: Number,
  },
  { timestamps: true }
);

export default mongoose.model("QuizAttempt", quizAttemptSchema);
