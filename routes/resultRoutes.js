const express = require("express");
const router = express.Router();
const { submitExam, getExamStats, getGlobalStats, clearExamStats } = require("../controllers/resultController");

router.delete("/exam/:examId", clearExamStats);
router.post("/submit", submitExam);
router.get("/stats/:id", getExamStats);
router.get("/stats", getGlobalStats);

module.exports = router;
