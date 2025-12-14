const express = require("express");
const router = express.Router();
const Exam = require("../models/exam")

// CONTROLLERS
const { createExam, getAllExams, getExamById, submitExam } = require("../controllers/examController");

router.delete("/clear", async (req, res) => {
  try {
    await Exam.deleteMany({});
    await Result.deleteMany({});

    res.json({
      success: true,
      message: "Barcha imtihonlar va natijalar o‘chirildi"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// CREATE EXAM (oddiy JSON)
router.post("/create", createExam);

// GET
router.get("/all", getAllExams);
router.get("/:id", getExamById);

// SUBMIT
router.post("/submit", submitExam);

module.exports = router;
