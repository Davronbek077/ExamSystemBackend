const express = require("express");
const router = express.Router();
const { submitExam, getExamStats, getGlobalStats } = require("../controllers/resultController");

router.post("/submit", submitExam);
router.get("/stats/:id", getExamStats);
router.get("/stats", getGlobalStats);

module.exports = router;
