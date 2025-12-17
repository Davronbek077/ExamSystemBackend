const Exam = require("../models/exam");
const Result = require("../models/result");

/* ================= SUBMIT EXAM ================= */
exports.submitExam = async (req, res) => {
  try {
    const { examId, answers = [] } = req.body;

    if (!examId) {
      return res.status(400).json({ message: "examId yo‘q" });
    }

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Imtihon topilmadi" });
    }

    let score = 0;
    let total = 0;

    // BASIC
    exam.questions.forEach(q => {
      total += q.points || 1;
      const user = answers.find(a => a.questionId === q._id.toString());
      if (!user || user.answer == null) return;

      if (
        String(user.answer).trim().toLowerCase() ===
        String(q.correctAnswer).trim().toLowerCase()
      ) {
        score += q.points || 1;
      }
    });

    // GRAMMAR
    exam.grammarQuestions.forEach(q => {
      total += q.points || 1;
      const user = answers.find(a => a.questionId === q._id.toString());
      if (!user || user.answer == null) return;

      if (
        user.answer.trim().toLowerCase() ===
        q.correctSentence.trim().toLowerCase()
      ) {
        score += q.points || 1;
      }
    });

    // TENSE
    exam.tenseTransforms.forEach(t => {
      t.transforms.forEach(tr => {
        total += tr.points || 1;
        const user = answers.find(a => a.questionId === tr._id.toString());
        if (!user || user.answer == null) return;

        if (
          user.answer.trim().toLowerCase() ===
          tr.correctSentence.trim().toLowerCase()
        ) {
          score += tr.points || 1;
        }
      });
    });

    // LISTENING TF
    exam.listeningTF.forEach(q => {
      total += 1;
      const user = answers.find(a => a.questionId === q._id.toString());
      if (!user || user.answer == null) return;

      if (
        String(user.answer).toLowerCase() ===
        String(q.correct).toLowerCase()
      ) {
        score += 1;
      }
    });

    // LISTENING GAP
    exam.listeningGaps.forEach(q => {
      total += 1;
      const user = answers.find(a => a.questionId === q._id.toString());
      if (!user || user.answer == null) return;

      if (
        user.answer.trim().toLowerCase() ===
        q.correctWord.trim().toLowerCase()
      ) {
        score += 1;
      }
    });

    const percentage = total === 0 ? 0 : Math.round((score / total) * 100);
    const passed = percentage >= exam.passPercentage;

    await Result.create({
      examId,
      answers,
      score,
      percentage,
      passed
    });

    res.json({ result: { score, percentage, passed } });

  } catch (err) {
    console.error("SUBMIT EXAM ERROR:", err);
    res.status(500).json({
      message: "Natija hisoblashda xato",
      error: err.message
    });
  }
};


/* ================= GET EXAM STATS ================= */
exports.getExamStats = async (req, res) => {
  try {
    const { id } = req.params; // examId

    const results = await Result.find({ examId: id });

    if (!results.length) {
      return res.json({
        totalAttempts: 0,
        passed: 0,
        failed: 0,
        averageScore: 0
      });
    }

    const totalAttempts = results.length;
    const passed = results.filter(r => r.passed).length;
    const failed = totalAttempts - passed;

    const averageScore = Math.round(
      results.reduce((sum, r) => sum + r.percentage, 0) / totalAttempts
    );

    res.json({
      totalAttempts,
      passed,
      failed,
      averageScore
    });

  } catch (err) {
    console.error("GET EXAM STATS ERROR:", err);
    res.status(500).json({
      message: "Statistikani olishda xato",
      error: err.message
    });
  }
};
