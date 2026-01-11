const Exam = require("../models/exam");
const Result = require("../models/result");

/* ===== HELPER ===== */
const normalize = (v) =>
  String(v ?? "").trim().toLowerCase();

/* ================= SUBMIT EXAM ================= */
exports.submitExam = async (req, res) => {
  try {
    const {
      examId,
      answers = [],
      studentName,
      writingText = ""
    } = req.body;

    if (!studentName) {
      return res.status(400).json({ message: "Ism kiritilmagan" });
    }

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Imtihon topilmadi" });
    }

    const checkShortAnswer = (userAnswer, keywords = []) => {
      if (!userAnswer || keywords.length === 0) return 0;
    
      const answer = normalize(userAnswer);
    
      let matched = 0;
    
      keywords.forEach(k => {
        if (answer.includes(normalize(k))) {
          matched++;
        }
      });
    
      if (matched === keywords.length) return 2; // 100%
      if (matched >= Math.ceil(keywords.length / 2)) return 1; // ≥50%
      return 0;
    };       

    let autoScore = 0;
    let autoMaxScore = 0;

    /* ================= READING ================= */
    if (exam.reading?.tfQuestions?.length) {
      exam.reading.tfQuestions.forEach(q => {
        autoMaxScore += exam.reading.pointsPerQuestion || 1;
        const user = answers.find(a => a.questionId === q._id.toString());
        if (user && normalize(user.answer) === normalize(q.correct)) {
          autoScore += exam.reading.pointsPerQuestion || 1;
        }
      });
    }

    if (exam.reading?.gapQuestions?.length) {
      exam.reading.gapQuestions.forEach(q => {
        autoMaxScore += exam.reading.pointsPerQuestion || 1;
        const user = answers.find(a => a.questionId === q._id.toString());
        if (user && normalize(user.answer) === normalize(q.correctWord)) {
          autoScore += exam.reading.pointsPerQuestion || 1;
        }
      });
    }

    /* ===== READING SHORT ANSWER ===== */
    if (exam.reading?.shortAnswerQuestions?.length) {
      exam.reading.shortAnswerQuestions.forEach(q => {
        const max = q.maxPoints || 2;
        autoMaxScore += max;
    
        const user = answers.find(
          a => a.questionId === q._id.toString()
        );
    
        if (user && user.answer) {
          const score = checkShortAnswer(
            user.answer,
            q.keywords || []
          );
    
          autoScore += Math.min(score, max);
        }
      });
    }

    /* ================= BASIC QUESTIONS ================= */
    exam.questions?.forEach(q => {
      autoMaxScore += q.points || 1;
      const user = answers.find(a => a.questionId === q._id.toString());
      if (user && normalize(user.answer) === normalize(q.correctAnswer)) {
        autoScore += q.points || 1;
      }
    });

    /* ================= GRAMMAR ================= */
    exam.grammarQuestions?.forEach(q => {
      autoMaxScore += q.points || 1;
      const user = answers.find(a => a.questionId === q._id.toString());
      if (user && normalize(user.answer) === normalize(q.correctSentence)) {
        autoScore += q.points || 1;
      }
    });

    /* ================= TENSE ================= */
    exam.tenseTransforms?.forEach(t => {
      t.transforms?.forEach(tr => {
        autoMaxScore += tr.points || 1;
        const user = answers.find(a => a.questionId === tr._id.toString());
        if (user && normalize(user.answer) === normalize(tr.correctSentence)) {
          autoScore += tr.points || 1;
        }
      });
    });

    /* ================= LISTENING ================= */
    exam.listeningTF?.forEach(q => {
      autoMaxScore += 1;
      const user = answers.find(a => a.questionId === q._id.toString());
      const correct = q.correct === true ? "true" : "false";
      if (user && normalize(user.answer) === correct) {
        autoScore += 1;
      }});

    exam.listeningGaps?.forEach(q => {
      autoMaxScore += 1;
      const user = answers.find(a => a.questionId === q._id.toString());
      if (user && normalize(user.answer) === normalize(q.correctWord)) {
        autoScore += 1;
      }
    });

    exam.translateQuestions?.forEach(q => {
      autoMaxScore += q.points || 1;
      const user = answers.find(a => a.questionId === q._id.toString());
      if (user && normalize(user.answer) === normalize(q.correctAnswer)) {
        autoScore += q.points || 1;
      }
    });

// ================= SENTENCE BUILD =================
// ================= SENTENCE BUILD =================
exam.sentenceBuildQuestions?.forEach(q => {

  const MAX_POINTS = 3; // ❗ qat’iy 3 ta
  autoMaxScore += MAX_POINTS;

  const user = req.body.sentenceBuildAnswers?.find(
    a => a.questionId === q._id.toString()
  );

  if (!user) return;

  let score = 0;

  const norm = v =>
    String(v || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");

  if (norm(user.affirmative) === norm(q.affirmative)) score += 1;
  if (norm(user.negative) === norm(q.negative)) score += 1;
  if (norm(user.question) === norm(q.question)) score += 1;

  autoScore += score;
});

    exam.completeQuestions?.forEach(block => {
      const pts = block.pointsPerSentence || 1;

      block.sentences.forEach(sentence => {
        autoMaxScore += pts;

        const user = answers.find(a => a.questionId === sentence._id.toString());

        if (user &&
          normalize(user.answer) === normalize(sentence.correctWord)
        ) {
          autoScore += pts;
        }
      });
    });

    exam.correctionQuestions?.forEach(q => {
      autoMaxScore += q.points || 1;
      const user = answers.find(a => a.questionId === q._id.toString());
      if (user && normalize(user.answer) === normalize(q.correctSentence)) {
        autoScore += q.points || 1;
      }
    });

    /* ================= FINAL AUTO RESULT ================= */
    const autoPercentage =
      autoMaxScore === 0
        ? 0
        : Math.round((autoScore / autoMaxScore) * 100);

    let status = "pending";
    if (!exam.writingTask) {
      status = autoPercentage >= exam.passPercentage ? "passed" : "failed";
    }

    /* ================= SAVE RESULT ================= */
    await Result.create({
      examId,
      studentName,
      answers,
      sentenceBuildAnswers: req.body.sentenceBuildAnswers || [],

      autoScore,
      autoMaxScore,
      autoPercentage,

      writing: {
        text: writingText,
        score: null,
        checked: false
      },

      finalScore: null,
      finalPercentage: null,
      status
    });

    res.json({
      message: "Imtihon topshirildi",
      autoScore,
      autoPercentage,
      writingPending: !!exam.writingTask
    });

  } catch (err) {
    console.error("SUBMIT EXAM ERROR:", err);
    res.status(500).json({
      message: "Xatolik",
      error: err.message
    });
  }
};

/* ================= GET EXAM STATS ================= */
exports.getExamStats = async (req, res) => {
  try {
    const examId = req.params.id;

    const results = await Result.find({ examId }).populate("examId", "writingTask").sort({ createdAt: -1 });

    const total = results.length;
    const passed = results.filter(r => r.status === "passed").length;
    const failed = results.filter(r => r.status === "failed").length;
    const pending = results.filter(r => r.status === "pending").length;

    res.json({
      total,
      passed,
      failed,
      pending,
      results: results.map(r => ({
        _id: r._id,
        studentName: r.studentName,
        percentage: r.finalPercentage ?? r.autoPercentage,
        status: r.status,
        writingChecked: r.writing.checked,
        writingScore: r.writing.score,
        writingMax: r.examId?.writingTask?.points || 0,
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

    const passed = await Result.countDocuments({status: "passed"});
    const failed = await Result.countDocuments({status: "failed"});
    const pending = await Result.countDocuments({status: "pending"});

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const today = await Result.countDocuments({
      createdAt: { $gte: todayStart }
    });

    res.json({
      total,
      passed,
      failed,
      pending,
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

exports.checkWriting = async (req, res) => {
  try {
    const {resultId} = req.params;
    const {writingScore} = req.body;

    const result = await Result.findById(resultId).populate("examId");
    if (!result) {
      return res.status(404).json({message: "Natija topilmadi"});
    }

    const writingPoints = result.examId.writingTask?.points || 0;

    if (writingScore < 0 || writingScore > writingPoints) {
      return res.status(400).json({message: "Noto'g'ri writing bali"});
    }

    const finalScore = result.autoScore + writingScore;

    const totalPoints = result.autoMaxScore + writingPoints;

    const finalPercentage = totalPoints === 0 ? 0 : Math.round((finalScore / totalPoints) * 100);

    const status = finalPercentage >= result.examId.passPercentage ? "passed" : "failed";

    result.writing.score = writingScore;
    result.writing.checked = true;

    result.finalScore = finalScore;
    result.finalPercentage = finalPercentage;
    result.status = status;

    await result.save();

    res.json({
      message: "Writing tekshirildi",
      result
    });
  } catch (err) {
    console.error("CHECK WRITING ERROR:", err);
    res.status(500).json({message: "Writing tekshirishda xato"});
  }
};

/* ================= GET ALL WRITINGS ================= */
exports.getAllWritings = async (req, res) => {
  try {
    const results = await Result.find({
      "writing.text": { $ne: "" }
    })
      .populate("examId", "title writingTask")
      .sort({ createdAt: -1 });

    res.json(results);
  } catch (err) {
    console.error("GET WRITINGS ERROR:", err);
    res.status(500).json({ message: "Writinglarni olishda xato" });
  }
};

/* ================= GET SINGLE WRITING ================= */
exports.getSingleWriting = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate("examId", "title writingTask passPercentage");

    if (!result) {
      return res.status(404).json({ message: "Writing topilmadi" });
    }

    res.json(result);
  } catch (err) {
    console.error("GET SINGLE WRITING ERROR:", err);
    res.status(500).json({ message: "Writingni olishda xato" });
  }
};
