const express = require("express");
const router = express.Router();

const {
  createCourse,
  getAllCourses,
  getCourseById,
  enrollInCourse,
  getMyCourses,
  updateCourse,
  deleteCourse,
} = require("../controllers/courseController");

const { protect } = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

/*
  @route   GET /api/courses
  @desc    Get all courses (Students)
  @access  Private
*/
router.get("/", protect, getAllCourses);

/*
  @route   GET /api/courses/my
  @desc    Get courses created by current instructor
  @access  Private (Instructor only)
*/
router.get(
  "/my",
  protect,
  roleMiddleware("instructor"),
  getMyCourses
);

/*
  @route   GET /api/courses/:id
  @desc    Get single course
  @access  Private
*/
router.get("/:id", protect, getCourseById);

/*
  @route   POST /api/courses
  @desc    Create course
  @access  Private (Instructor only)
*/
router.post(
  "/",
  protect,
  roleMiddleware("instructor"),
  createCourse
);

/*
  @route   POST /api/courses/:id/enroll
  @desc    Enroll in course
  @access  Private
*/
router.post("/:id/enroll", protect, enrollInCourse);

/*
  @route   PUT /api/courses/:id
  @desc    Update course
  @access  Private (Instructor - Owner)
*/
router.put(
  "/:id",
  protect,
  roleMiddleware("instructor"),
  updateCourse
);

/*
  @route   DELETE /api/courses/:id
  @desc    Delete course
  @access  Private (Instructor - Owner)
*/
router.delete(
  "/:id",
  protect,
  roleMiddleware("instructor"),
  deleteCourse
);


module.exports = router;
