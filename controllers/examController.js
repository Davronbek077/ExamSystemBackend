const Exam = require("../models/exam");
const Result = require("../models/result");

// ===============================
//      CREATE EXAM
// ===============================
exports.createExam = async (req, res) => {
  try {
    let {
      title,
      timeLimit,
      passPercentage,
      questions,
      grammarQuestions,
      tenseTransforms,
      listeningTF,
      listeningGaps
    } = req.body;

    // ✅ AUDIO — faqat filename saqlanadi
    let listeningAudio = null;
    if (req.file) {
      listeningAudio = req.file.filename;
    }

    // ✅ JSON parse
    questions = questions ? JSON.parse(questions) : [];
    grammarQuestions = grammarQuestions ? JSON.parse(grammarQuestions) : [];
    tenseTransforms = tenseTransforms ? JSON.parse(tenseTransforms) : [];
    listeningTF = listeningTF ? JSON.parse(listeningTF) : [];
    listeningGaps = listeningGaps ? JSON.parse(listeningGaps) : [];

    // ✅ MODEL NOMLARI BILAN MOS
    const exam = await Exam.create({
      title,
      timeLimit,
      passPercentage,
      listeningAudio,
      questions,
      grammarQuestions,
      tenseTransforms,     // 🔥 TO‘G‘RI
      listeningTF,
      listeningGaps
    });

    res.status(201).json({ success: true, exam });
  } catch (err) {
    console.error("CREATE EXAM ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// ===============================
//      GET ALL EXAMS
// ===============================
exports.getAllExams = async (req, res) => {
  try {
    const exams = await Exam.find().sort({ createdAt: -1 });
    res.json(exams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===============================
//      GET ONE EXAM
// ===============================
exports.getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ error: "Exam not found" });
    res.json(exam);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===============================
//      SUBMIT EXAM
// ===============================
exports.submitExam = async (req, res) => {
  try {
    const { examId, answers } = req.body;

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ error: "Exam not found" });

    let score = 0;

    // ===========================================
    // 1) BASIC QUESTIONS
    // ===========================================
    exam.questions.forEach((q) => {
      const ans = answers.find(a => a.qid === q._id.toString());
      if (!ans) return;

      if (
        ans.answer.trim().toLowerCase() ===
        q.correctAnswer.trim().toLowerCase()
      ) {
        score += q.points;
      }
    });

    // ===========================================
    // 2) LISTENING TRUE/FALSE
    // ===========================================
    exam.listeningTF.forEach((item, i) => {
      const ans = answers.find(a => a.qid === "ltf" + i);
      if (!ans) return;
      if (String(item.correct) === String(ans.answer)) score += 1;
    });

    // ===========================================
    // 3) LISTENING GAPFILL
    // ===========================================
    exam.listeningGaps.forEach((item, i) => {
      const ans = answers.find(a => a.qid === "lgap" + i);
      if (!ans) return;

      if (
        item.correctWord.trim().toLowerCase() ===
        ans.answer.trim().toLowerCase()
      ) {
        score += 1;
      }
    });

    // ===========================================
    // 4) GRAMMAR
    // ===========================================
    exam.grammarQuestions.forEach((item, i) => {
      const ans = answers.find(a => a.qid === "grammar" + i);
      if (!ans) return;

      if (
        item.correctSentence.trim().toLowerCase() ===
        ans.answer.trim().toLowerCase()
      ) {
        score += item.points || 1;
      }
    });

    // ===========================================
    // 5) TENSE TRANSFORMATION (🔥 TUZATILDI)
    // ===========================================
    exam.tenseTransforms.forEach((q, qi) => {
      q.transforms.forEach((t, ti) => {
        const ans = answers.find(a => a.qid === `tense${qi}_${ti}`);
        if (!ans) return;

        if (
          t.correctSentence.trim().toLowerCase() ===
          ans.answer.trim().toLowerCase()
        ) {
          score += q.points || 1;
        }
      });
    });

    // ===========================================
    // TOTAL
    // ===========================================
    const total =
      exam.questions.length +
      exam.listeningTF.length +
      exam.listeningGaps.length +
      exam.grammarQuestions.length +
      exam.tenseTransforms.reduce((s, q) => s + q.transforms.length, 0);

    const percentage = Math.round((score / total) * 100);
    const passed = percentage >= (exam.passPercentage || 50);

    const result = await Result.create({
      examId,
      answers,
      score,
      percentage,
      passed,
      submittedAt: new Date(),
    });

    res.json({ message: "Exam submitted", result });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
