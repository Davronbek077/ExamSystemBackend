const express = require("express");
const router = express.Router();
const { submitExam, getExamStats, getGlobalStats, clearExamStats, 
    checkWriting, getAllWritings, getSingleWriting, getSingleResult } = require("../controllers/resultController");

router.delete("/exam/:examId", clearExamStats);
router.post("/submit", submitExam);
router.get("/writings", getAllWritings);
router.get("/writings/:id", getSingleWriting);
router.get("/stats/:id", getExamStats);
router.get("/stats", getGlobalStats);
router.post("/check-writing/:resultId", checkWriting);
router.get("/:id", getSingleResult);

module.exports = router;
