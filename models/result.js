const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    answers: [
      {
        questionId: mongoose.Schema.Types.ObjectId,
        answer: String,
      },
    ],
    score: Number,
    percentage: Number,
    passed: Boolean,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Result", resultSchema);
