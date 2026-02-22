const Exam = require("../models/exam");
const Result = require("../models/result");

/* ===== HELPER ===== */
const normalize = (v) =>
  String(v ?? "").trim().toLowerCase().replace(/\s+/g, " ");

/* ================= SUBMIT EXAM ================= */
exports.submitExam = async (req, res) => {
  
  console.log("SUBMIT BODY:", req.body);

  const countedQuestions = new Set();
  try {
    const {
      examId,
      answers = [],
      studentName,
      writingText = ""
    } = req.body;

    console.log(
      "ANSWERS IDS:",
      answers.map(a => a.questionId)
    );

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

    const levelStats = {};

    function addToLevel(level, earned, total) {
      if (!level) return;

      if (!levelStats[level]) {
        levelStats[level] = {
          earned: 0,
          total: 0
        };
      }

      levelStats[level].earned += earned;
      levelStats[level].total += total;
    }

    /* ================= READING ================= */
    exam.reading.tfQuestions.forEach(q => {
      const pts = exam.reading.pointsPerQuestion || 1;
      autoMaxScore += pts;
    
      const user = answers.find(a => a.questionId === q._id.toString());
    
      let earned = 0;
    
      if (user && normalize(user.answer) === normalize(q.correct)) {
        earned = pts;
        autoScore += pts;
      }
    
      addToLevel(q.level, earned, pts); // 🔥
    });

    exam.reading.gapQuestions?.forEach(q => {
      const pts = exam.reading.pointsPerQuestion || 1;
      autoMaxScore += pts;
    
      const user = answers.find(a => a.questionId === q._id.toString());
      let earned = 0;
    
      if (user && normalize(user.answer) === normalize(q.correctWord)) {
        earned = pts;
        autoScore += pts;
      }
    
      addToLevel(q.level, earned, pts); // 🔥
    });

    /* ===== READING SHORT ANSWER ===== */
    exam.reading.shortAnswerQuestions?.forEach(q => {
      const max = q.maxPoints || 2;
      autoMaxScore += max;
    
      const user = answers.find(a => a.questionId === q._id.toString());
      let earned = 0;
    
      if (user && user.answer) {
        earned = checkShortAnswer(user.answer, q.keywords || []);
        earned = Math.min(earned, max);
        autoScore += earned;
      }
    
      addToLevel(q.level, earned, max); // 🔥
    });
    
    exam.translationQuestions?.forEach(q => {
      const pts = q.points || 1;
      autoMaxScore += pts;
    
      const user = answers.find(a => a.questionId === q._id.toString());
      let earned = 0;
    
      if (user && normalize(user.answer) === normalize(q.correctAnswer)) {
        earned = pts;
        autoScore += pts;
      }
    
      addToLevel(q.level || "Beginner", earned, pts); // 🔥 addToLevel qo‘shildi
    });   
    

    /* ================= BASIC QUESTIONS ================= */
    exam.questions?.forEach(q => {
      const pts = q.points || 1;
      autoMaxScore += pts;
    
      const user = answers.find(a => a.questionId === q._id.toString());
    
      let earned = 0;
    
      if (user && normalize(user.answer) === normalize(q.correctAnswer)) {
        earned = pts;
        autoScore += pts;
      }
    
      addToLevel(q.level, earned, pts);
    });

    /* ================= GRAMMAR ================= */
    exam.grammarQuestions?.forEach(q => {
      const pts = q.points || 1;
      autoMaxScore += pts;
    
      const user = answers.find(a => a.questionId === q._id.toString());
    
      let earned = 0;
    
      if (user && normalize(user.answer) === normalize(q.correctSentence)) {
        earned = pts;
        autoScore += pts;
      }
    
      addToLevel(q.level, earned, pts); // 🔥
    });

    /* ================= TENSE ================= */
exam.tenseTransforms?.forEach(t => {
  t.transforms?.forEach(tr => {
    const pts = tr.points || 1;
    autoMaxScore += pts;

    const user = answers.find(a => a.questionId === tr._id.toString());

    let earned = 0;

    if (user && normalize(user.answer) === normalize(tr.correctSentence)) {
      earned = pts;
      autoScore += pts;
    }

    addToLevel(tr.level, earned, pts); // 🔥
  });
});

    /* ================= LISTENING ================= */
    exam.listeningTF?.forEach(q => {
      const pts = 1;
      autoMaxScore += pts;
    
      const user = answers.find(a => a.questionId === q._id.toString());
      let earned = 0;
    
      const correct = q.correct ? "true" : "false";
      if (user && normalize(user.answer) === correct) {
        earned = pts;
        autoScore += pts;
      }
    
      addToLevel(q.level, earned, pts); // 🔥
    });

    exam.listeningGaps?.forEach(q => {
      const pts = 1;
      autoMaxScore += pts;
    
      const user = answers.find(a => a.questionId === q._id.toString());
      let earned = 0;
    
      if (user && normalize(user.answer) === normalize(q.correctWord)) {
        earned = pts;
        autoScore += pts;
      }
    
      addToLevel(q.level, earned, pts); // 🔥 addToLevel qo‘shildi
    });

    exam.translateQuestions?.forEach(q => {
      const pts = q.points || 1;
      autoMaxScore += pts;
    
      const user = answers.find(a => a.questionId === q._id.toString());
      let earned = 0;
    
      if (user && normalize(user.answer) === normalize(q.correctAnswer)) {
        earned = pts;
        autoScore += pts;
      }
    
      addToLevel(q.level, earned, pts); // 🔥
    });   

// ================= SENTENCE BUILD =================
exam.sentenceBuildQuestions?.forEach(q => {
  const MAX_POINTS = 3;
  autoMaxScore += MAX_POINTS;

  const user = req.body.sentenceBuildAnswers?.find(
    a => a.questionId === q._id.toString()
  );

  let earned = 0;

  if (user) {
    const norm = v =>
      String(v || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

    if (norm(user.affirmative) === norm(q.affirmative)) earned++;
    if (norm(user.negative) === norm(q.negative)) earned++;
    if (norm(user.question) === norm(q.question)) earned++;

    autoScore += earned;
  }

  addToLevel(q.level, earned, MAX_POINTS); // 🔥
});

exam.completeQuestions?.forEach(block => {
  const pts = block.pointsPerSentence || 1;

  block.sentences.forEach(sentence => {
    autoMaxScore += pts;

    const user = answers.find(a => a.questionId === sentence._id.toString());
    let earned = 0;

    if (user && normalize(user.answer) === normalize(sentence.correctWord)) {
      earned = pts;
      autoScore += pts;
    }

    addToLevel(sentence.level, earned, pts); // 🔥
  });
});

exam.correctionQuestions?.forEach(q => {
  const pts = q.points || 1;
  autoMaxScore += pts;

  const user = answers.find(a => a.questionId === q._id.toString());
  let earned = 0;

  if (user && normalize(user.answer) === normalize(q.correctSentence)) {
    earned = pts;
    autoScore += pts;
  }

  addToLevel(q.level, earned, pts); // 🔥
});

const levelOrder = [
  "Beginner",
  "Elementary",
  "Pre-intermediate",
  "Pre-IELTS",
  "IELTS-Foundation",
  "IELTS-Max"
];

let studentLevel = levelOrder[0];

for (let lvl of levelOrder) {
  const stats = levelStats[lvl];

  if (!stats || stats.total === 0) continue;

  const percent = (stats.earned / stats.total) * 100;

  if (percent < exam.passPercentage) {
    studentLevel = lvl;
    break;
  }

  studentLevel = lvl;
}

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

      studentLevel,
      levelStats,

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
      studentLevel,
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

exports.getSingleResult = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id).populate("examId");
    if (!result) {
      return res.status(404).json({ message: "Result topilmadi" });
    }

    const exam = result.examId;
    const detailedAnswers = [];

    const normalize = v =>
      String(v ?? "").trim().toLowerCase().replace(/\s+/g, " ");

    const findAnswer = (id) =>
      result.answers.find(a => a.questionId.toString() === id.toString());

    /* ===== BASIC QUESTIONS ===== */
    exam.questions?.forEach(q => {
      const user = findAnswer(q._id);
      const isCorrect = user && normalize(user.answer) === normalize(q.correctAnswer);

      detailedAnswers.push({
        section: "Basic",
        questionText: q.questionText,
        correctAnswer: q.correctAnswer,
        studentAnswer: user?.answer || "",
        isCorrect,
        points: isCorrect ? q.points : 0
      });
    });

    /* ===== GRAMMAR ===== */
    exam.grammarQuestions?.forEach(q => {
      const user = findAnswer(q._id);
      const isCorrect = user && normalize(user.answer) === normalize(q.correctSentence);

      detailedAnswers.push({
        section: "Grammar",
        questionText: q.scrambledWords,
        correctAnswer: q.correctSentence,
        studentAnswer: user?.answer || "",
        isCorrect,
        points: isCorrect ? q.points : 0
      });
    });

    /* ===== TENSE ===== */
    exam.tenseTransforms?.forEach(t => {
      t.transforms?.forEach(tr => {
        const user = findAnswer(tr._id);
        const isCorrect = user && normalize(user.answer) === normalize(tr.correctSentence);

        detailedAnswers.push({
          section: "Tense",
          questionText: `${t.baseSentence} → ${tr.tense}`,
          correctAnswer: tr.correctSentence,
          studentAnswer: user?.answer || "",
          isCorrect,
          points: isCorrect ? tr.points : 0
        });
      });
    });

    /* ===== LISTENING TF ===== */
    exam.listeningTF?.forEach(q => {
      const user = findAnswer(q._id);
      const correct = q.correct ? "true" : "false";
      const isCorrect = user && normalize(user.answer) === correct;

      detailedAnswers.push({
        section: "Listening",
        questionText: q.statement,
        correctAnswer: correct,
        studentAnswer: user?.answer || "",
        isCorrect,
        points: isCorrect ? 1 : 0
      });
    });

    /* ===== COMPLETE ===== */
    exam.completeQuestions?.forEach(block => {
      block.sentences.forEach(sentence => {
        const user = findAnswer(sentence._id);
        const isCorrect = user && normalize(user.answer) === normalize(sentence.correctWord);

        detailedAnswers.push({
          section: "Complete",
          questionText: sentence.text,
          correctAnswer: sentence.correctWord,
          studentAnswer: user?.answer || "",
          isCorrect,
          points: isCorrect ? block.pointsPerSentence : 0
        });
      });
    });

    /* ===== CORRECTION ===== */
    exam.correctionQuestions?.forEach(q => {
      const user = findAnswer(q._id);
      const isCorrect = user && normalize(user.answer) === normalize(q.correctSentence);

      detailedAnswers.push({
        section: "Correction",
        questionText: q.wrongSentence,
        correctAnswer: q.correctSentence,
        studentAnswer: user?.answer || "",
        isCorrect,
        points: isCorrect ? q.points : 0
      });
    });

    /* ===== TRANSLATE ===== */
    exam.translateQuestions?.forEach(q => {
      const user = findAnswer(q._id);
      const isCorrect = user && normalize(user.answer) === normalize(q.correctAnswer);

      detailedAnswers.push({
        section: "Translate",
        questionText: q.word,
        correctAnswer: q.correctAnswer,
        studentAnswer: user?.answer || "",
        isCorrect,
        points: isCorrect ? q.points : 0
      });
    });

    /* ===== FINAL ===== */
    res.json({
      studentName: result.studentName,
      percentage: result.finalPercentage ?? result.autoPercentage,
      status: result.status,
      answers: detailedAnswers
    });

  } catch (err) {
    console.error("GET SINGLE RESULT ERROR:", err);
    res.status(500).json({ message: "Server error" });
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
