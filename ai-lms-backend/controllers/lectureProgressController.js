import LectureProgress from "../models/LectureProgress.js";

// ================= UPDATE PROGRESS =================
export const updateLectureProgress = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const { watchedPercent = 0, timeSpent = 0, courseId } = req.body;

    // 🔒 Basic validation
    if (!courseId) {
      return res.status(400).json({
        message: "courseId is required",
      });
    }

    // 🧪 Clamp watchedPercent (0–100)
    const safeWatchedPercent = Math.min(
      100,
      Math.max(0, watchedPercent)
    );

    let progress = await LectureProgress.findOne({
      user: req.user._id,
      lecture: lectureId,
    });

    if (!progress) {
      progress = await LectureProgress.create({
        user: req.user._id,
        course: courseId,
        lecture: lectureId,
        watchedPercent: safeWatchedPercent,
        timeSpent,
        completed: safeWatchedPercent >= 90,
      });
    } else {
      progress.watchedPercent = Math.max(
        progress.watchedPercent,
        safeWatchedPercent
      );
      progress.timeSpent += timeSpent;
      progress.completed = progress.watchedPercent >= 90;
      await progress.save();
    }

    res.status(200).json(progress);
  } catch (error) {
    console.error("Lecture progress error:", error);
    res.status(500).json({ message: "Failed to update progress" });
  }
};

// ================= GET PROGRESS BY COURSE =================
export const getProgressByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const progress = await LectureProgress.find({
      user: req.user._id,
      course: courseId,
    }).populate("lecture", "title");

    res.status(200).json(progress);
  } catch (error) {
    console.error("Get progress error:", error);
    res.status(500).json({ message: "Failed to fetch progress" });
  }
};
