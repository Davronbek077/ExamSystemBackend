const Exam = require("../models/Exam");
const Result = require("../models/Result");

exports.submitExam = async (req, res) => {
  try {
    const { examId, answers } = req.body;

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: "Imtihon topilmadi" });

    let score = 0;
    let total = 0;

    exam.questions.forEach(q => {
      total += q.points;

      const userAns = answers.find(a => a.questionId === q._id.toString());
      if (!userAns) return;

      if (userAns.answer === q.correctAnswer) {
        score += q.points;
      }
    });

    const percentage = Math.round((score / total) * 100);
    const passed = percentage >= exam.passPercentage;

    const result = await Result.create({
      examId,
      score,
      percentage,
      passed,
      createdAt: new Date()
    });

    res.json({
      result: {
        score,
        percentage,
        passed
      }
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Natija hisoblashda xato" });
  }
};

exports.getExamStats = async (req, res) => {
  const { id } = req.params;

  const total = await Result.countDocuments({ examId: id });
  const passed = await Result.countDocuments({ examId: id, passed: true });
  const failed = total - passed;

  res.json({ total, passed, failed });
};
