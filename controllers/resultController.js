const Result = require("../models/result");
const Exam = require("../models/exam");

// STUDENT — submit exam
exports.submitExam = async (req, res) => {
  try {
    const { examId, answers } = req.body;
    const studentId = req.user._id;

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ error: "Exam not found" });

    // calculate score
    let score = 0;
    exam.questions.forEach((q) => {
      const studentAnswer = Array.isArray(answers) ? answers.find(a => a.questionId === q._id.toString()) : null;
      if (!studentAnswer) return;
      if (["mcq", "truefalse"].includes(q.type)) {
        if (studentAnswer.answer === q.correctAnswer) score += q.points;
      } else {
        if (String(studentAnswer.answer).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase()) {
          score += q.points;
        }
      }
    });

    const total = exam.questions.reduce((sum, q) => sum + (q.points || 0), 0) || 1;
    const percentage = Math.round((score / total) * 100);
    const passed = percentage >= (exam.passPercentage || 50);

    const result = await Result.create({
      examId,
      studentId,
      answers,
      score,
      percentage,
      passed,
      submittedAt: new Date()
    });

    res.status(200).json({ message: "Exam submitted", result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
};

// TEACHER — get exam stats
exports.getExamStats = async (req, res) => {
  try {
    const examId = req.params.id;
    const results = await Result.find({ examId }).populate("studentId", "name email");

    const total = results.length;
    const passed = results.filter(r => r.passed).length;
    const failed = total - passed;

    res.json({
      total,
      passed,
      failed,
      passPercentage: total ? Math.round((passed / total) * 100) : 0,
      results
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
