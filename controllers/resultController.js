const Exam = require("../models/exam");
const Result = require("../models/result");

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

    let autoScore = 0;
    let autoMaxScore = 0;

    // ================= READING =================
    if (exam.reading?.tfQuestions?.length) {
      exam.reading.tfQuestions.forEach(q => {
        autoMaxScore += exam.reading.pointsPerQuestion || 1;
        const user = answers.find(a => a.questionId === q._id.toString());
        if (user && String(user.answer) === String(q.correct)) {
          autoScore += exam.reading.pointsPerQuestion || 1;
        }
      });
    }

    if (exam.reading?.gapQuestions?.length) {
      exam.reading.gapQuestions.forEach(q => {
        autoMaxScore += exam.reading.pointsPerQuestion || 1;
        const user = answers.find(a => a.questionId === q._id.toString());
        if (
          user &&
          user.answer?.trim().toLowerCase() ===
          q.correctWord.trim().toLowerCase()
        ) {
          autoScore += exam.reading.pointsPerQuestion || 1;
        }
      });
    }

    // ================= BASIC =================
    exam.questions?.forEach(q => {
      autoMaxScore += q.points || 1;
      const user = answers.find(a => a.questionId === q._id.toString());
      if (
        user &&
        String(user.answer).trim().toLowerCase() ===
        String(q.correctAnswer).trim().toLowerCase()
      ) {
        autoScore += q.points || 1;
      }
    });

    // ================= GRAMMAR =================
    exam.grammarQuestions?.forEach(q => {
      autoMaxScore += q.points || 1;
      const user = answers.find(a => a.questionId === q._id.toString());
      if (
        user &&
        user.answer.trim().toLowerCase() ===
        q.correctSentence.trim().toLowerCase()
      ) {
        autoScore += q.points || 1;
      }
    });

    // ================= TENSE =================
    exam.tenseTransforms?.forEach(t => {
      t.transforms?.forEach(tr => {
        autoMaxScore += tr.points || 1;
        const user = answers.find(a => a.questionId === tr._id.toString());
        if (
          user &&
          user.answer.trim().toLowerCase() ===
          tr.correctSentence.trim().toLowerCase()
        ) {
          autoScore += tr.points || 1;
        }
      });
    });

    // ================= LISTENING =================
    exam.listeningTF?.forEach(q => {
      autoMaxScore += 1;
      const user = answers.find(a => a.questionId === q._id.toString());
      if (user && String(user.answer) === String(q.correct)) {
        autoScore += 1;
      }
    });

    exam.listeningGaps?.forEach(q => {
      autoMaxScore += 1;
      const user = answers.find(a => a.questionId === q._id.toString());
      if (
        user &&
        user.answer.trim().toLowerCase() ===
        q.correctWord.trim().toLowerCase()
      ) {
        autoScore += 1;
      }
    });

    const autoPercentage =
      autoMaxScore === 0 ? 0 : Math.round((autoScore / autoMaxScore) * 100);

      let status = "pending";

       if (!exam.writingTask) {
         status = autoPercentage >= exam.passPercentage ? "passed" : "failed";
      }

    // ================= SAVE RESULT =================
    await Result.create({
      examId,
      studentName,
      answers,
    
      // AUTO RESULT
      autoScore,
      autoMaxScore,
      autoPercentage,
    
      // WRITING
      writing: {
        text: writingText,
        score: null,
        checked: false
      },
    
      // FINAL (hali yo‘q)
      finalScore: null,
      finalPercentage: null,
      status
    });    

    res.json({
      message: "Imtihon topshirildi",
      autoScore,
      autoPercentage,
      writingPending: true
    });

  } catch (err) {
    console.error("SUBMIT EXAM ERROR:", err);
    res.status(500).json({ message: "Xatolik", error: err.message });
  }
};


/* ================= GET EXAM STATS ================= */
exports.getExamStats = async (req, res) => {
  try {
    const examId = req.params.id;

    const results = await Result.find({ examId }).sort({ createdAt: -1 });

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
    result. finalPercentage = finalPercentage;
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
