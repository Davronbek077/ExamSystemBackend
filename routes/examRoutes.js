const express = require("express");
const router = express.Router();

const Exam = require("../models/exam");
const Result = require("../models/result"); // 👈 SHU MUHIM

const {
  createExam,
  getAllExams,
  getExamById,
} = require("../controllers/examController");

// =========================
// CLEAR ALL EXAMS
// =========================
router.delete("/clear", async (req, res) => {
  try {
    await Exam.deleteMany({});
    await Result.deleteMany({}); // 👈 endi Result mavjud

    res.json({
      success: true,
      message: "Barcha imtihonlar va natijalar o‘chirildi"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ROUTES
router.post("/create", createExam);
router.get("/all", getAllExams);
router.get("/:id", getExamById);

module.exports = router;
