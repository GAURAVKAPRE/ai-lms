const LectureProgress = require("../models/LectureProgress");

// ================= UPDATE PROGRESS =================
exports.updateLectureProgress = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const { watchedPercent, timeSpent } = req.body;

    let progress = await LectureProgress.findOne({
      user: req.user._id,
      lecture: lectureId,
    });

    if (!progress) {
      progress = await LectureProgress.create({
        user: req.user._id,
        course: req.body.courseId,
        lecture: lectureId,
        watchedPercent: watchedPercent || 0,
        timeSpent: timeSpent || 0,
        completed: watchedPercent >= 90,
      });
    } else {
      progress.watchedPercent = watchedPercent;
      progress.timeSpent += timeSpent || 0;
      progress.completed = watchedPercent >= 90;
      await progress.save();
    }

    res.status(200).json(progress);
  } catch (error) {
    console.error("Lecture progress error:", error);
    res.status(500).json({ message: "Failed to update progress" });
  }
};
