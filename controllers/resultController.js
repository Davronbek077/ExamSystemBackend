const Result = require("../models/result");
const Exam = require("../models/exam");

exports.submitExam = async (req, res) => {
  try {
    console.log("SUBMIT BODY:", req.body);

    const { examId, answers } = req.body;

    if (!examId || !Array.isArray(answers)) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }

    let totalQuestions = 0;
    let correctAnswers = 0;

    /* ===== BASIC QUESTIONS ===== */
    exam.questions.forEach((q) => {
      totalQuestions++;
      const userAnswer = answers.find(
        (a) => a.questionId.toString() === q._id.toString()
      );

      if (!userAnswer) return;

      if (
        String(userAnswer.answer).toLowerCase().trim() ===
        String(q.correctAnswer).toLowerCase().trim()
      ) {
        correctAnswers++;
      }
    });

    /* ===== GRAMMAR ===== */
    exam.grammarQuestions.forEach((q) => {
      totalQuestions++;
      const userAnswer = answers.find(
        (a) => a.questionId.toString() === q._id.toString()
      );
      if (!userAnswer) return;

      if (
        userAnswer.answer.toLowerCase().trim() ===
        q.correctSentence.toLowerCase().trim()
      ) {
        correctAnswers++;
      }
    });

    /* ===== TENSE ===== */
    exam.tenseTransforms.forEach((t) => {
      t.transforms.forEach((tr) => {
        totalQuestions++;
        const userAnswer = answers.find(
          (a) => a.questionId.toString() === tr._id.toString()
        );
        if (!userAnswer) return;

        if (
          userAnswer.answer.toLowerCase().trim() ===
          tr.correct.toLowerCase().trim()
        ) {
          correctAnswers++;
        }
      });
    });

    /* ===== LISTENING TF ===== */
    exam.listeningTF.forEach((q) => {
      totalQuestions++;
      const userAnswer = answers.find(
        (a) => a.questionId.toString() === q._id.toString()
      );
      if (!userAnswer) return;

      if (
        String(userAnswer.answer).toLowerCase() ===
        String(q.correct).toLowerCase()
      ) {
        correctAnswers++;
      }
    });

    /* ===== LISTENING GAP ===== */
    exam.listeningGaps.forEach((q) => {
      totalQuestions++;
      const userAnswer = answers.find(
        (a) => a.questionId.toString() === q._id.toString()
      );
      if (!userAnswer) return;

      if (
        userAnswer.answer.toLowerCase().trim() ===
        q.correct.toLowerCase().trim()
      ) {
        correctAnswers++;
      }
    });

    const percentage =
      totalQuestions === 0
        ? 0
        : Math.round((correctAnswers / totalQuestions) * 100);

    const passed = percentage >= exam.passPercentage;

    const result = await Result.create({
      examId,
      answers,
      score: correctAnswers,
      percentage,
      passed,
    });

    res.json({
      success: true,
      result,
    });
  } catch (err) {
    console.error("SUBMIT EXAM ERROR:", err);
    res.status(500).json({ error: err.message });
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
