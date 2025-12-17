const Exam = require("../models/exam");
const Result = require("../models/result");

exports.submitExam = async (req, res) => {
  try {
    const { examId, answers } = req.body;

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Imtihon topilmadi" });
    }

    let score = 0;
    let total = 0;

    const normalize = (v) =>
      v?.toString().trim().toLowerCase();

    // ===== BASIC QUESTIONS =====
    exam.questions.forEach(q => {
      total += q.points || 1;
      const user = answers.find(a => a.questionId === q._id.toString());

      if (user && normalize(user.answer) === normalize(q.correctAnswer)) {
        score += q.points || 1;
      }
    });

    // ===== GRAMMAR =====
    exam.grammarQuestions.forEach(q => {
      total += q.points || 1;
      const user = answers.find(a => a.questionId === q._id.toString());

      if (user && normalize(user.answer) === normalize(q.correctSentence)) {
        score += q.points || 1;
      }
    });

    // ===== TENSE TRANSFORMS =====
    exam.tenseTransforms.forEach(block => {
      block.transforms.forEach(t => {
        total += t.points || 1;

        const user = answers.find(
          a => a.questionId === t._id.toString()
        );

        if (user && normalize(user.answer) === normalize(t.correctSentence)) {
          score += t.points || 1;
        }
      });
    });

    // ===== LISTENING TRUE/FALSE =====
    exam.listeningTF.forEach(q => {
      total += 1;
      const user = answers.find(a => a.questionId === q._id.toString());

      if (user && String(q.correct) === String(user.answer)) {
        score += 1;
      }
    });

    // ===== LISTENING GAP =====
    exam.listeningGaps.forEach(q => {
      total += 1;
      const user = answers.find(a => a.questionId === q._id.toString());

      if (user && normalize(user.answer) === normalize(q.correctWord)) {
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
      passed,
    });

    res.json({
      score,
      percentage,
      passed
    });

  } catch (err) {
    console.error("SUBMIT ERROR:", err);
    res.status(500).json({ message: "Natija hisoblashda xato" });
  }
};