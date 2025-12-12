const express = require("express");
const router = express.Router();
const { submitExam, getExamStats } = require("../controllers/resultController");

router.post("/submit", submitExam);
router.get("/stats/:id", getExamStats);

module.exports = router;
