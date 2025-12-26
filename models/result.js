const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },

    studentName: {
      type: String,
      required: true
    },

    answers: [
      {
        questionId: mongoose.Schema.Types.ObjectId,
        answer: String,
      },
    ],

    writing: {
      text: String,
      score: { type: Number, default: null }, // teacher qo‘yadi
      checked: { type: Boolean, default: false }
    },
  
    autoScore: Number,
    totalScore: Number,
    percentage: Number,
    passed: Boolean,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Result", resultSchema);
