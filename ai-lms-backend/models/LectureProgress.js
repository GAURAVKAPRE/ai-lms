const mongoose = require("mongoose");

const lectureProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    lecture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecture",
      required: true,
    },

    watchedPercent: {
      type: Number,
      default: 0, // 0–100
    },

    completed: {
      type: Boolean,
      default: false,
    },

    timeSpent: {
      type: Number, // in seconds
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "LectureProgress",
  lectureProgressSchema
);
