import LectureProgress from "../models/LectureProgress.js";

const getStudyAdvice = async (req, res) => {
  try {
    const progress = await LectureProgress.find({
      user: req.user._id,
      course: req.params.courseId,
    }).populate("lecture", "title");

    const advice = [];
    const suggestions = [];

    progress.forEach((p) => {
      if (!p.lecture) return;

      if (p.watchedPercent < 50) {
        advice.push(
          `🔴 You barely watched "${p.lecture.title}". Rewatch it carefully.`
        );

        suggestions.push({
          lectureId: p.lecture._id,
          lectureTitle: p.lecture.title,
          level: "low",
          message: "Rewatch this lecture from the beginning",
        });
      } else if (p.watchedPercent < 70) {
        advice.push(
          `🟡 Revisit "${p.lecture.title}" to strengthen your understanding.`
        );

        suggestions.push({
          lectureId: p.lecture._id,
          lectureTitle: p.lecture.title,
          level: "medium",
          message: "Revisit important parts of this lecture",
        });
      }
    });

    if (advice.length === 0) {
      advice.push("🟢 Great job! You are progressing well. Keep going 🚀");
    }

    res.status(200).json({
      advice,
      suggestions,
    });
  } catch (error) {
    console.error("Study advice error:", error);
    res.status(500).json({
      message: "Failed to generate study advice",
    });
  }
};

export { getStudyAdvice };
