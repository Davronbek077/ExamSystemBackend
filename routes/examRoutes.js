const express = require("express");
const router = express.Router();

const {
  createExam,
  getAllExams,
  getExamById,
  submitExam
} = require("../controllers/examController");

router.delete("/clear", async (req, res) => {
  try {
    const result = await Exam.deleteMany({});
    res.json({
      success: true,
      deletedCount: result.deletedCount,
      message: "Barcha examlar o‘chirildi"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/create", createExam);
router.get("/all", getAllExams);
router.get("/:id", getExamById);
router.post("/submit", submitExam);

module.exports = router;
