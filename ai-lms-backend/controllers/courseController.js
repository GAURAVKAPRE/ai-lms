import Course from "../models/Course.js";
import User from "../models/User.js";

// ================= CREATE COURSE =================
export const createCourse = async (req, res) => {
  try {
    const { title, description, price, category } = req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required" });
    }

    const course = await Course.create({
      title,
      description,
      category: category || "General",
      price,
      instructor: req.user._id,
    });

    // Track course under instructor profile
    req.user.instructorProfile.coursesCreated.push(course._id);
    await req.user.save();

    res.status(201).json(course);
  } catch (error) {
    console.error("CREATE COURSE ERROR:", error);
    res.status(500).json({ message: "Failed to create course" });
  }
};

// ================= GET ALL COURSES =================
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate(
      "instructor",
      "name email"
    );
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch courses" });
  }
};

// ================= GET MY COURSES (INSTRUCTOR) =================
export const getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({
      instructor: req.user._id,
    });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch instructor courses" });
  }
};

// ================= GET COURSE BY ID =================
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate(
      "instructor",
      "name email"
    );

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch course" });
  }
};

// ================= ENROLL COURSE (FIXED) =================
export const enrollInCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // 🚫 Instructor cannot enroll in own course
    if (String(course.instructor) === String(req.user._id)) {
      return res.status(400).json({
        message: "Instructor cannot enroll in their own course",
      });
    }

    // 🔒 Safe ObjectId comparison
    const alreadyEnrolled = req.user.enrolledCourses.some(
      (cid) => String(cid) === String(course._id)
    );

    if (alreadyEnrolled) {
      return res.status(400).json({ message: "Already enrolled" });
    }

    // ✅ SYMMETRIC ENROLLMENT (CRITICAL FIX)
    req.user.enrolledCourses.push(course._id);
    await req.user.save();

    course.enrolledStudents.push(req.user._id);
    await course.save();

    res.json({ message: "Enrolled successfully" });
  } catch (error) {
    console.error("ENROLL COURSE ERROR:", error);
    res.status(500).json({ message: "Enrollment failed" });
  }
};

// ================= UPDATE COURSE =================
export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (String(course.instructor) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Whitelist updates
    const allowedFields = ["title", "description", "price", "category", "level"];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        course[field] = req.body[field];
      }
    });

    await course.save();
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};

// ================= DELETE COURSE =================
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (String(course.instructor) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await course.deleteOne();
    res.json({ message: "Course deleted" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
};
