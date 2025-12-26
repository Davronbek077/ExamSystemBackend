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
    let autoTotal = 0;

    // ================= READING =================
    if (exam.reading?.tfQuestions?.length) {
      exam.reading.tfQuestions.forEach(q => {
        autoTotal += exam.reading.pointsPerQuestion || 1;
        const user = answers.find(a => a.questionId === q._id.toString());
        if (user && String(user.answer) === String(q.correct)) {
          autoScore += exam.reading.pointsPerQuestion || 1;
        }
      });
    }

    if (exam.reading?.gapQuestions?.length) {
      exam.reading.gapQuestions.forEach(q => {
        autoTotal += exam.reading.pointsPerQuestion || 1;
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
      autoTotal += q.points || 1;
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
      autoTotal += q.points || 1;
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
        autoTotal += tr.points || 1;
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
      autoTotal += 1;
      const user = answers.find(a => a.questionId === q._id.toString());
      if (user && String(user.answer) === String(q.correct)) {
        autoScore += 1;
      }
    });

    exam.listeningGaps?.forEach(q => {
      autoTotal += 1;
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
      autoTotal === 0 ? 0 : Math.round((autoScore / autoTotal) * 100);

    // ================= SAVE RESULT =================
    await Result.create({
      examId,
      studentName,
      answers,
    
      // AUTO RESULT
      autoScore,
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
      passed: false
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
    const passed = results.filter(r => r.passed).length;
    const failed = total - passed;

    res.json({
      total,
      passed,
      failed,
      results: results.map(r => ({
        _id: r._id,
        studentName: r.studentName,
        percentage: r.finalPercentage ?? r.autoPercentage,
        passed: r.passed,
        writingChecked: r.writing.checked,
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

    const totalPoints = result.autoScore + writingPoints;

    const finalPercentage = totalPoints === 0 ? 0 : Math.round((finalScore / totalPoints) * 100);

    const passed = finalPercentage >= result.examId.passPercentage;

    result.writing.score = writingScore;
    result.writing.checked = true;

    result.finalScore = finalScore;
    result. finalPercentage = finalPercentage;
    result.passed = passed;

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