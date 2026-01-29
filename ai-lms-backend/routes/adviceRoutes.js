const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { getStudyAdvice } = require("../controllers/adviceController");

router.get("/:courseId", protect, getStudyAdvice);

module.exports = router;
