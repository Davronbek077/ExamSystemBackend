const Exam = require("../models/exam");
const Result = require("../models/result");

/* ================= SUBMIT EXAM ================= */
exports.submitExam = async (req, res) => {
  try {
    const { examId, answers = [], studentName } = req.body;

    if (!studentName) {
      return res.status(400).json({message: "Ism kiritilmagan"});
    }

    if (!examId) {
      return res.status(400).json({ message: "examId yo‘q" });
    }

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Imtihon topilmadi" });
    }

    let score = 0;
    let total = 0;

    // ===== READING TF =====
if (exam.reading?.tfQuestions?.length) {
  exam.reading.tfQuestions.forEach(q => {
    total += exam.reading.pointsPerQuestion || 1;

    const user = answers.find(
      a => a.questionId === q._id.toString()
    );

    if (!user || user.answer == null) return;

    if (String(user.answer) === String(q.correct)) {
      score += exam.reading.pointsPerQuestion || 1;
    }
  });
}

// ===== READING GAP =====
if (exam.reading?.gapQuestions?.length) {
  exam.reading.gapQuestions.forEach(q => {
    total += exam.reading.pointsPerQuestion || 1;

    const user = answers.find(
      a => a.questionId === q._id.toString()
    );

    if (!user || !user.answer) return;

    if (
      user.answer.trim().toLowerCase() ===
      q.correctWord.trim().toLowerCase()
    ) {
      score += exam.reading.pointsPerQuestion || 1;
    }
  });
}

    // BASIC
    exam.questions?.forEach(q => {
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
    exam.grammarQuestions?.forEach(q => {
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
    exam.tenseTransforms?.forEach(t => {
      t.transforms?.forEach(tr => {
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
    exam.listeningTF?.forEach(q => {
      total += 1;
      const user = answers.find(a => a.questionId === q._id.toString());
      if (!user || user.answer == null) return;
    
      if (String(user.answer) === String(q.correct)) {
        score += 1;
      }
    });

    // LISTENING GAP
    exam.listeningGaps?.forEach(q => {
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
      studentName,
      answers,
      score,
      percentage,
      passed
    });

    res.json({ result: { score, percentage, passed, studentName } });

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
    const examId = req.params.id;

    const results = await Result.find({ examId }).sort({ createdAt: -1 });

    const total = results.length;
    const passed = results.filter(r => r.passed).length;
    const failed = total - passed;

    res.json({
      total,
      passed,
      failed,
      results: results.map(r => ({
        _id: r._id,
        studentName: r.studentName,
        percentage: r.percentage,
        passed: r.passed,
        createdAt: r.createdAt
      }))
    });

  } catch (err) {
    res.status(500).json({ message: "Statistika xato" });
  }
};

exports.getGlobalStats = async (req, res) => {
  try {
    const total = await Result.countDocuments();

    const passed = await Result.countDocuments({ passed: true });

    const failed = await Result.countDocuments({ passed: false });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const today = await Result.countDocuments({
      createdAt: { $gte: todayStart }
    });

    res.json({
      total,
      passed,
      failed,
      today
    });
  } catch (err) {
    console.error("STATS ERROR:", err);
    res.status(500).json({ error: "Statistikani olishda xato" });
  }
};

exports.clearExamStats = async (req, res) => {
  try {
    await Result.deleteMany({ examId: req.params.examId });

    res.json({
      success: true,
      message: "Ushbu imtihon statistikasi o‘chirildi"
    });
  } catch (err) {
    res.status(500).json({ error: "Statistikani o‘chirishda xato" });
  }
};
