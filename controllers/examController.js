const Exam = require("../models/exam");
const Result = require("../models/result");

// ===============================
//      CREATE EXAM
// ===============================
exports.createExam = async (req, res) => {
  try {
    const { title, timeLimit, passPercentage, questions, listeningTF, listeningGaps } = req.body;
    const listeningAudio = req.file ? req.file.path : null;

    const exam = await Exam.create({
      title,
      timeLimit,
      passPercentage,
      questions,
      listeningTF,
      listeningGaps,
      listeningAudio
    });

    res.status(201).json({ success: true, exam });
  } catch (err) {
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
    const studentId = req.user._id;

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ error: "Exam not found" });

    let score = 0;

    // Basic questions
    exam.questions.forEach((q) => {
      const ans = answers.find(a => a.qid === q._id.toString());
      if (!ans) return;

      if (ans.answer.toLowerCase() === q.correctAnswer.toLowerCase()) {
        score += q.points;
      }
    });

    // True/False
    exam.listeningTF.forEach((item, i) => {
      const ans = answers.find(a => a.qid === "ltf" + i);
      if (!ans) return;

      if (String(item.correct) === String(ans.answer)) score += 1;
    });

    // Gap fills
    exam.listeningGaps.forEach((item, i) => {
      const ans = answers.find(a => a.qid === "lgap" + i);
      if (!ans) return;

      if (item.correctWord.trim().toLowerCase() === ans.answer.trim().toLowerCase()) {
        score += 1;
      }
    });

    const total =
      exam.questions.length +
      exam.listeningTF.length +
      exam.listeningGaps.length;

    const percentage = Math.round((score / total) * 100);
    const passed = percentage >= (exam.passPercentage || 50);

    const result = await Result.create({
      examId,
      studentId,
      answers,
      score,
      percentage,
      passed,
      submittedAt: new Date(),
    });

    res.status(200).json({ message: "Exam submitted", result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
