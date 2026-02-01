import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { getStudyAdvice } from "../controllers/adviceController.js";

const router = express.Router();

router.get("/:courseId", protect, getStudyAdvice);

export default router;
