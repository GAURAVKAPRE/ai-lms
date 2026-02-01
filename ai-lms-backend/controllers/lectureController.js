import Lecture from "../models/Lecture.js";
import Course from "../models/Course.js";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import axios from "axios";
import chunkText from "../utils/chunkText.js";

// ================= CREATE LECTURE =================
const createLecture = async (req, res) => {
  try {
    console.log("📥 FILES RECEIVED:", req.files);

    const { title, description, order } = req.body;
    const { courseId } = req.params;

    if (!title || !title.trim()) {
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
    let pdfChunks = [];
    let isChunked = false;

    if (pdfFile?.location) {
      try {
        console.log("📄 Fetching PDF from S3:", pdfFile.location);

        const response = await axios.get(pdfFile.location, {
          responseType: "arraybuffer",
        });

        const contentType = response.headers["content-type"];
        if (!contentType || !contentType.includes("pdf")) {
          return res.status(400).json({
            message: "Uploaded file is not a valid PDF",
          });
        }

        const parsed = await pdfParse(response.data);
        extractedPdfText = parsed.text?.trim() || "";

        console.log("✅ PDF TEXT LENGTH:", extractedPdfText.length);

        // 🚨 Reject scanned / empty PDFs
        if (extractedPdfText.length === 0) {
          return res.status(400).json({
            message:
              "PDF text could not be extracted. Please upload a text-based PDF (not scanned).",
          });
        }

        // 🧩 PHASE 2 — CHUNKING
        pdfChunks = chunkText(extractedPdfText);
        isChunked = true;
      } catch (err) {
        console.error("❌ PDF extraction failed:", err.message);
        return res.status(500).json({
          message: "Failed to extract text from PDF",
        });
      }
    }

    // ================= SAVE =================
    const lecture = await Lecture.create({
      title,
      description,
      order: order || 0,
      videoUrl: videoFile ? videoFile.location : "",
      pdfUrl: pdfFile ? pdfFile.location : "",
      pdfText: extractedPdfText,
      isTextExtracted: extractedPdfText.length > 0,
      pdfChunks,
      isChunked,
      course: courseId,
    });

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
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (String(course.instructor) === String(req.user._id)) {
      const lectures = await Lecture.find({ course: courseId }).sort({
        order: 1,
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
      order: 1,
      createdAt: 1,
    });

    res.json(lectures);
  } catch (error) {
    console.error("Get lectures error:", error);
    res.status(500).json({ message: "Failed to fetch lectures" });
  }
};

// ================= UPDATE LECTURE =================
const updateLecture = async (req, res) => {
  try {
    const { id } = req.params;
    const lecture = await Lecture.findById(id);
    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    const course = await Course.findById(lecture.course);
    if (String(course.instructor) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // 🔄 Re-upload PDF
    if (req.files?.pdf?.[0]?.location) {
      try {
        const response = await axios.get(req.files.pdf[0].location, {
          responseType: "arraybuffer",
        });

        const parsed = await pdfParse(response.data);
        const newText = parsed.text?.trim() || "";

        if (!newText) {
          return res.status(400).json({
            message:
              "PDF text could not be extracted. Please upload a text-based PDF.",
          });
        }

        // 🧩 Re-chunk on PDF update
        const newChunks = chunkText(newText);

        lecture.pdfUrl = req.files.pdf[0].location;
        lecture.pdfText = newText;
        lecture.isTextExtracted = true;
        lecture.pdfChunks = newChunks;
        lecture.isChunked = true;
      } catch (err) {
        console.error("PDF re-extraction failed:", err.message);
        return res.status(500).json({
          message: "Failed to re-extract PDF text",
        });
      }
    }

    await lecture.save();
    res.json(lecture);
  } catch (error) {
    console.error("Update lecture error:", error);
    res.status(500).json({ message: "Failed to update lecture" });
  }
};

// ================= DELETE LECTURE =================
const deleteLecture = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);
    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

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

export {
  createLecture,
  getLecturesByCourse,
  updateLecture,
  deleteLecture,
};
