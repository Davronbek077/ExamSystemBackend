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

    questions = questions ? JSON.parse(questions) : [];
    grammarQuestions = grammarQuestions ? JSON.parse(grammarQuestions) : [];
    tenseTransforms = tenseTransforms ? JSON.parse(tenseTransforms) : [];
    listeningTF = listeningTF ? JSON.parse(listeningTF) : [];
    listeningGaps = listeningGaps ? JSON.parse(listeningGaps) : [];

    const exam = await Exam.create({
      title,
      timeLimit,
      passPercentage,
      questions,
      grammarQuestions,
      tenseTransforms,
      listeningTF,
      listeningGaps
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
//      GET EXAM BY ID
// ===============================
exports.getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }
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
    let { examId, studentName, answers, score } = req.body;

    answers = answers ? JSON.parse(answers) : [];

    const result = await Result.create({
      examId,
      studentName,
      answers,
      score: score || 0,
      submittedAt: new Date()
    });

    res.status(201).json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
