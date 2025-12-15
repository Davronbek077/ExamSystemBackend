const Result = require("../models/result");
const Exam = require("../models/exam");

exports.submitExam = async (req, res) => {
  try {
    console.log("========== SUBMIT EXAM START ==========");
    console.log("REQ BODY:", JSON.stringify(req.body, null, 2));

    const { examId, answers } = req.body;

    console.log("EXAM ID:", examId);
    console.log("ANSWERS COUNT:", answers?.length);

    if (!examId || !Array.isArray(answers)) {
      console.log("❌ INVALID PAYLOAD");
      return res.status(400).json({ error: "Invalid payload" });
    }

    const exam = await Exam.findById(examId);
    console.log("EXAM FOUND:", !!exam);

    if (!exam) {
      console.log("❌ EXAM NOT FOUND");
      return res.status(404).json({ error: "Exam not found" });
    }

    let totalQuestions = 0;
    let correctAnswers = 0;

    /* ===== BASIC QUESTIONS ===== */
    console.log("---- BASIC QUESTIONS ----");
    exam.questions.forEach((q) => {
      totalQuestions++;

      const userAnswer = answers.find(
        (a) => String(a.questionId) === String(q._id)
      );

      console.log("Q:", q._id, "USER ANSWER:", userAnswer?.answer);

      if (!userAnswer) return;

      if (
        String(userAnswer.answer).toLowerCase().trim() ===
        String(q.correctAnswer).toLowerCase().trim()
      ) {
        correctAnswers++;
      }
    });

    /* ===== GRAMMAR ===== */
    console.log("---- GRAMMAR ----");
    exam.grammarQuestions.forEach((q) => {
      totalQuestions++;

      const userAnswer = answers.find(
        (a) => String(a.questionId) === String(q._id)
      );

      console.log("GRAMMAR Q:", q._id, "ANSWER:", userAnswer?.answer);

      if (!userAnswer) return;

      if (
        userAnswer.answer.toLowerCase().trim() ===
        q.correctSentence.toLowerCase().trim()
      ) {
        correctAnswers++;
      }
    });

    /* ===== TENSE ===== */
    console.log("---- TENSE ----");
    exam.tenseTransforms.forEach((t) => {
      t.transforms.forEach((tr) => {
        totalQuestions++;

        const userAnswer = answers.find(
          (a) => String(a.questionId) === String(tr._id)
        );

        console.log("TENSE Q:", tr._id, "ANSWER:", userAnswer?.answer);

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
    console.log("---- LISTENING TF ----");
    exam.listeningTF.forEach((q) => {
      totalQuestions++;

      const userAnswer = answers.find(
        (a) => String(a.questionId) === String(q._id)
      );

      console.log("LIST TF Q:", q._id, "ANSWER:", userAnswer?.answer);

      if (!userAnswer) return;

      if (
        String(userAnswer.answer).toLowerCase() ===
        String(q.correct).toLowerCase()
      ) {
        correctAnswers++;
      }
    });

    /* ===== LISTENING GAP ===== */
    console.log("---- LISTENING GAP ----");
    exam.listeningGaps.forEach((q) => {
      totalQuestions++;

      const userAnswer = answers.find(
        (a) => String(a.questionId) === String(q._id)
      );

      console.log("LIST GAP Q:", q._id, "ANSWER:", userAnswer?.answer);

      if (!userAnswer) return;

      if (
        userAnswer.answer.toLowerCase().trim() ===
        q.correct.toLowerCase().trim()
      ) {
        correctAnswers++;
      }
    });

    console.log("TOTAL QUESTIONS:", totalQuestions);
    console.log("CORRECT:", correctAnswers);

    const percentage =
      totalQuestions === 0
        ? 0
        : Math.round((correctAnswers / totalQuestions) * 100);

    const passed = percentage >= exam.passPercentage;

    console.log("PERCENTAGE:", percentage);
    console.log("PASSED:", passed);

    const result = await Result.create({
      examId,
      answers,
      score: correctAnswers,
      percentage,
      passed,
    });

    console.log("✅ RESULT SAVED:", result._id);
    console.log("========== SUBMIT EXAM END ==========");

    res.json({ success: true, result });
  } catch (err) {
    console.error("🔥 SUBMIT EXAM ERROR FULL:", err);
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
