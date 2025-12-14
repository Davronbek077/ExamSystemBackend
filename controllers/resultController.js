const Result = require("../models/result");
const Exam = require("../models/exam");

exports.submitExam = async (req, res) => {
  try {
    let { examId, answers, studentId } = req.body;

    answers = typeof answers === "string" ? JSON.parse(answers) : answers;

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ error: "Exam not found" });

    let score = 0;
    let total = 0;

    // =====================
    // BASIC QUESTIONS
    // =====================
    exam.questions.forEach((q) => {
      total += q.points || 1;

      const studentAnswer = answers.find(
        a => a.questionId === q._id.toString()
      );

      if (!studentAnswer) return;

      if (
        String(studentAnswer.answer).trim().toLowerCase() ===
        String(q.correctAnswer).trim().toLowerCase()
      ) {
        score += q.points || 1;
      }
    });

    // =====================
    // LISTENING TRUE/FALSE
    // =====================
    exam.listeningTF?.forEach((q, index) => {
      total += 1;

      const a = answers.find(
        x => x.type === "listeningTF" && x.index === index
      );

      if (a && a.answer === q.correct) {
        score += 1;
      }
    });

    // =====================
    // LISTENING GAPFILL
    // =====================
    exam.listeningGaps?.forEach((q, index) => {
      total += 1;

      const a = answers.find(
        x => x.type === "listeningGap" && x.index === index
      );

      if (
        a &&
        a.answer.trim().toLowerCase() ===
        q.correctWord.trim().toLowerCase()
      ) {
        score += 1;
      }
    });

    const percentage = Math.round((score / (total || 1)) * 100);
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

    res.json({ success: true, result });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};



// TEACHER — get exam stats
exports.getExamStats = async (req, res) => {
  try {
    const examId = req.params.id;
    const results = await Result.find({ examId });

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
