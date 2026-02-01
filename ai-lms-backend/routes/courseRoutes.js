import express from "express";
const router = express.Router();

import {
  createCourse,
  getAllCourses,
  getMyCourses,
  getCourseById,
  enrollInCourse,
  updateCourse,
  deleteCourse,
} from "../controllers/courseController.js";

import { protect } from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

// GET all courses
router.get("/", protect, getAllCourses);

// GET instructor's courses
router.get(
  "/my",
  protect,
  roleMiddleware("instructor"),
  getMyCourses
);

// GET single course
router.get("/:id", protect, getCourseById);

// CREATE course
router.post(
  "/",
  protect,
  roleMiddleware("instructor"),
  createCourse
);

// ENROLL course
router.post("/:id/enroll", protect, enrollInCourse);

// UPDATE course
router.put(
  "/:id",
  protect,
  roleMiddleware("instructor"),
  updateCourse
);

// DELETE course
router.delete(
  "/:id",
  protect,
  roleMiddleware("instructor"),
  deleteCourse
);

export default router;
