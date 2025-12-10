const mongoose = require("mongoose");

const listeningTFSchema = new mongoose.Schema({
  statement: String,
  correct: Boolean
});

const listeningGapSchema = new mongoose.Schema({
  sentence: String,
  correctWord: String
});

const questionSchema = new mongoose.Schema({
  type: { type: String, enum: ["mcq", "truefalse", "gapfill", "grammar"] },
  questionText: String,
  options: [String],
  correctAnswer: String,
  points: { type: Number, default: 1 }
});

const examSchema = new mongoose.Schema({
  title: { type: String, required: true },
  timeLimit: Number,
  passPercentage: Number,

  listeningAudio: String,

  listeningTF: [listeningTFSchema],
  listeningGaps: [listeningGapSchema],

  questions: [questionSchema]
}, { timestamps: true });

module.exports = mongoose.model("Exam", examSchema);
