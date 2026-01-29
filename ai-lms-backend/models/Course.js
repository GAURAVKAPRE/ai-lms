const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    fileUrl: String, // video or pdf URL (later)
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },

    price: {
      type: Number,
      default: 0, // 0 = free course
    },

    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    lessons: [lessonSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
