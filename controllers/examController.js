const Exam = require("../models/exam");

exports.createExam = async (req, res) => {
  try {
    const { title, timeLimit, passPercentage, questions } = req.body;
    const listeningAudio = req.file ? req.file.path : null;

    const exam = await Exam.create({
      title,
      timeLimit,
      passPercentage,
      questions,
      listeningAudio
    });

    res.status(201).json({ success: true, exam });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
