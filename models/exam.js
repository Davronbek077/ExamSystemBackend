const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  type: { type: String, enum: ["mcq", "truefalse", "gapfill", "grammar", "listening"], required: true },
  questionText: String,
  options: [String],
  correctAnswer: String,
  points: { type: Number, default: 1 }
});

const examSchema = new mongoose.Schema({
  title: { type: String, required: true },
  timeLimit: { type: Number, required: true },
  passPercentage: { type: Number, default: 50 },
  questions: [questionSchema],
  listeningAudio: String
}, { timestamps: true });

// model name must match refs used elsewhere ("Exam")
module.exports = mongoose.model("Exam", examSchema);
