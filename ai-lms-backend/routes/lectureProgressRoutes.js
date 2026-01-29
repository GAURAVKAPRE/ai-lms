const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const {
  updateLectureProgress,
} = require("../controllers/lectureProgressController");

router.post(
  "/:lectureId",
  protect,
  updateLectureProgress
);

module.exports = router;
