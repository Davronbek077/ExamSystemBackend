const Exam = require("../models/exam");
const Result = require("../models/result");

// ===============================
//      CREATE EXAM
// ===============================

exports.createExam = async (req, res) => {
  try {
    const {
      title,
      timeLimit,
      passPercentage,
      questions = [],
      grammarQuestions = [],
      tenseTransforms = [],
      listeningTF = [],
      listeningGaps = []
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

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

exports.deleteExam = async (req, res) => {
  try {
    const {id} = req.params;

    const exam = await Exam.findByIdAndDelete(id);
    if (!exam) {
      return res.status(404).json({message: "Imtihon topilmadi"});
    }

    res.json({message: "Imtihon o'chirildi"});
  } catch (err) {
    res.status(500).json({message: "O'chirishda xato"});
  }
};

exports.updateExam = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Exam.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Imtihon topilmadi" });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Tahrirlashda xato" });
  }
};
