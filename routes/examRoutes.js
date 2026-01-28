const express = require("express");
const router = express.Router();

const Exam = require("../models/exam");
const Result = require("../models/result"); // 👈 SHU MUHIM

const {
  createExam,
  getAllExams,
  getExamById,
  deleteExam,
  updateExam
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

router.get("/levels", async (req, res) => {
  try {
    const levels = await Exam.distinct("level");
    res.json(levels);
  } catch (err) {
    res.status(500).json({message: "Level fetch error"});
  }
});

// GET EXAMS BY LEVEL
router.get("/by-level/:level", async (req, res) => {
  try {
    const { level } = req.params;

    const exams = await Exam.find({ level }).sort({ createdAt: -1 });

    res.json(exams);
  } catch (err) {
    res.status(500).json({ message: "Exam fetch error" });
  }
});

// ROUTES
router.post("/create", createExam);
router.get("/all", getAllExams);
router.get("/:id", getExamById);
router.delete("/:id", deleteExam);
router.put("/:id", updateExam);

module.exports = router;
