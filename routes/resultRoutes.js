const express = require("express");
const router = express.Router();
const { submitExam, getExamStats } = require("../controllers/resultController");
const { protect, teacherOnly } = require("../middleware/auth");

router.post("/submit", protect, submitExam);
router.get("/stats/:id", protect, teacherOnly, getExamStats);

module.exports = router;
