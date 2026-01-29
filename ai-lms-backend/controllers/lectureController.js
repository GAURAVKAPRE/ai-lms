const Lecture = require("../models/Lecture");
const Course = require("../models/Course");
const pdfParse = require("pdf-parse");
const axios = require("axios");


// ================= CREATE LECTURE =================
const createLecture = async (req, res) => {
  try {
    console.log("📥 FILES RECEIVED:", req.files);

    const { title, description, order } = req.body;
    const { courseId } = req.params;

    if (!title) {
      return res.status(400).json({ message: "Lecture title is required" });
    }

    const videoFile = req.files?.video?.[0];
    const pdfFile = req.files?.pdf?.[0];

    if (!videoFile && !pdfFile) {
      return res.status(400).json({
        message: "At least one resource (video or PDF) is required",
      });
    }

    // 🔍 Check course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // 🔐 Ownership check
    if (String(course.instructor) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // ================= PDF TEXT EXTRACTION =================
    let extractedPdfText = "";

    if (pdfFile?.location) {
      try {
        console.log("📄 Fetching PDF from S3:", pdfFile.location);

        const response = await axios.get(pdfFile.location, {
          responseType: "arraybuffer",
        });

        const parsed = await pdfParse(response.data);
        extractedPdfText = parsed.text?.trim() || "";

        console.log("✅ PDF TEXT LENGTH:", extractedPdfText.length);
      } catch (err) {
        console.error("❌ PDF extraction failed:", err.message);
      }
    }

    if (pdfFile && extractedPdfText.length === 0) {
      console.warn(
        "⚠️ PDF uploaded but NO TEXT extracted. Quiz will not work."
      );
    }

    // ================= SAVE =================
    const lecture = await Lecture.create({
      title,
      description,
      order,
      videoUrl: videoFile ? videoFile.location : "",
      pdfUrl: pdfFile ? pdfFile.location : "",
      pdfText: extractedPdfText, // 🔥 NOW WILL BE FILLED
      course: courseId,
    });
     console.log("🧪 typeof pdfParse:", typeof pdfParse);

    res.status(201).json(lecture);
  } catch (error) {
    console.error("Create lecture error:", error);
    res.status(500).json({ message: "Failed to create lecture" });
  }
};

// ================= GET LECTURES =================
const getLecturesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (String(course.instructor) === String(req.user._id)) {
      const lectures = await Lecture.find({ course: courseId }).sort({
        createdAt: 1,
      });
      return res.json(lectures);
    }

    const isEnrolled = course.enrolledStudents.some(
      (id) => String(id) === String(req.user._id)
    );

    if (!isEnrolled) {
      return res.status(403).json({ message: "Enroll to access lectures" });
    }

    const lectures = await Lecture.find({ course: courseId }).sort({
      createdAt: 1,
    });

    res.json(lectures);
  } catch (error) {
    console.error("Get lectures error:", error);
    res.status(500).json({ message: "Failed to fetch lectures" });
  }
};

// ================= UPDATE =================
const updateLecture = async (req, res) => {
  try {
    const { id } = req.params;
    const lecture = await Lecture.findById(id);
    if (!lecture) return res.status(404).json({ message: "Lecture not found" });

    const course = await Course.findById(lecture.course);
    if (String(course.instructor) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (req.files?.pdf?.[0]?.location) {
      lecture.pdfUrl = req.files.pdf[0].location;

      try {
        const response = await axios.get(lecture.pdfUrl, {
          responseType: "arraybuffer",
        });
        const parsed = await pdfParse(response.data);
        lecture.pdfText = parsed.text?.trim() || "";
      } catch (err) {
        console.error("PDF re-extraction failed:", err.message);
      }
    }

    await lecture.save();
    res.json(lecture);
  } catch (error) {
    console.error("Update lecture error:", error);
    res.status(500).json({ message: "Failed to update lecture" });
  }
};

// ================= DELETE =================
const deleteLecture = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);
    if (!lecture) return res.status(404).json({ message: "Lecture not found" });

    const course = await Course.findById(lecture.course);
    if (String(course.instructor) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await lecture.deleteOne();
    res.json({ message: "Lecture deleted successfully" });
  } catch (error) {
    console.error("Delete lecture error:", error);
    res.status(500).json({ message: "Failed to delete lecture" });
  }
};

module.exports = {
  createLecture,
  getLecturesByCourse,
  updateLecture,
  deleteLecture,
};
