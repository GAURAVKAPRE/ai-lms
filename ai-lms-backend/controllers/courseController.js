const Course = require("../models/Course");

// ================= CREATE COURSE =================
exports.createCourse = async (req, res) => {
  try {
    const { title, description, category, level, price } = req.body;

    // ✅ Validation
    if (!title || !description || !category) {
      return res.status(400).json({
        message: "Title, description and category are required",
      });
    }

    // ✅ Instructor check
    if (!req.user.instructorProfile?.enabled) {
      return res.status(403).json({ message: "Instructor access required" });
    }

    const course = await Course.create({
      title,
      description,
      category,
      level: level || "Beginner",
      price: price || 0,
      instructor: req.user._id,
    });

    // 🔗 Link course to instructor
    req.user.instructorProfile.coursesCreated.push(course._id);
    await req.user.save();

    res.status(201).json(course);
  } catch (error) {
    console.error("Create course error:", error);
    res.status(500).json({
      message: error.message || "Failed to create course",
    });
  }
};

// ================= GET ALL COURSES (STUDENT) =================
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate(
      "instructor",
      "name email"
    );
    res.status(200).json(courses);
  } catch (error) {
    console.error("Get all courses error:", error);
    res.status(500).json({ message: "Failed to fetch courses" });
  }
};

// ================= GET MY COURSES (INSTRUCTOR) =================
exports.getMyCourses = async (req, res) => {
  try {
    if (!req.user.instructorProfile?.enabled) {
      return res.status(403).json({ message: "Instructor access required" });
    }

    const courses = await Course.find({
      instructor: req.user._id,
    });

    res.status(200).json(courses);
  } catch (error) {
    console.error("Get my courses error:", error);
    res.status(500).json({ message: "Failed to fetch instructor courses" });
  }
};

// ================= GET SINGLE COURSE =================
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructor", "name email");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json(course);
  } catch (error) {
    console.error("Get course error:", error);
    res.status(500).json({ message: "Failed to fetch course" });
  }
};

// ================= ENROLL IN COURSE =================
exports.enrollInCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // 🚫 Instructor cannot enroll in own course
    if (course.instructor.toString() === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "Instructor cannot enroll in own course" });
    }

    // ❌ Already enrolled
    if (course.enrolledStudents.includes(req.user._id)) {
      return res.status(400).json({ message: "Already enrolled" });
    }

    course.enrolledStudents.push(req.user._id);
    await course.save();

    req.user.enrolledCourses.push(course._id);
    await req.user.save();

    res.status(200).json({ message: "Enrolled successfully" });
  } catch (error) {
    console.error("Enroll error:", error);
    res.status(500).json({ message: "Enrollment failed" });
  }
};

// ================= UPDATE COURSE =================
exports.updateCourse = async (req, res) => {
  try {
    const { title, description, category, level, price } = req.body;

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // 🔐 Ownership check
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    course.title = title ?? course.title;
    course.description = description ?? course.description;
    course.category = category ?? course.category;
    course.level = level ?? course.level;
    course.price = price ?? course.price;

    await course.save();

    res.status(200).json(course);
  } catch (error) {
    console.error("Update course error:", error);
    res.status(500).json({ message: "Failed to update course" });
  }
};

// ================= DELETE COURSE =================
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // 🔐 Ownership check
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await course.deleteOne();

    // 🧹 Remove from instructor profile
    req.user.instructorProfile.coursesCreated =
      req.user.instructorProfile.coursesCreated.filter(
        (cid) => cid.toString() !== course._id.toString()
      );

    await req.user.save();

    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Delete course error:", error);
    res.status(500).json({ message: "Failed to delete course" });
  }
};
