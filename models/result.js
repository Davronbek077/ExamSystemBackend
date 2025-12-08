const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
  examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  answers: [{ questionId: String, answer: String }],
  score: Number,
  percentage: Number,
  passed: Boolean,
  autoSubmitted: { type: Boolean, default: false },
  submittedAt: Date
}, { timestamps: true });

module.exports = mongoose.model("Result", resultSchema);
