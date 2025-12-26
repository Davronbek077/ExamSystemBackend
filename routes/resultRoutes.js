const express = require("express");
const router = express.Router();
const { submitExam, getExamStats, getGlobalStats, clearExamStats, checkWriting } = require("../controllers/resultController");

router.delete("/exam/:examId", clearExamStats);
router.post("/submit", submitExam);
router.get("/stats/:id", getExamStats);
router.get("/stats", getGlobalStats);
router.post("/check-writing/:resultId", checkWriting);

module.exports = router;
