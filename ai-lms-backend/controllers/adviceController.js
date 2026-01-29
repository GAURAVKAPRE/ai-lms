const LectureProgress = require("../models/LectureProgress");

exports.getStudyAdvice = async (req, res) => {
  try {
    const progress = await LectureProgress.find({
      user: req.user._id,
      course: req.params.courseId,
    }).populate("lecture");

    let advice = [];

    progress.forEach((p) => {
      if (p.watchedPercent < 50) {
        advice.push(
          `🔴 You barely watched "${p.lecture.title}". Rewatch it carefully.`
        );
      } else if (p.watchedPercent < 70) {
        advice.push(
          `🟡 Revisit "${p.lecture.title}" to strengthen your understanding.`
        );
      }
    });

    if (advice.length === 0) {
      advice.push(
        "🟢 Great job! You are progressing well. Keep going 🚀"
      );
    }

    res.status(200).json({ advice });
  } catch (error) {
    console.error("Study advice error:", error);
    res.status(500).json({
      message: "Failed to generate study advice",
    });
  }
};
