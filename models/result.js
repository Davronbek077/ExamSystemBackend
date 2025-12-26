const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true
    },

    studentName: {
      type: String,
      required: true
    },

    answers: [
      {
        questionId: mongoose.Schema.Types.ObjectId,
        answer: String
      }
    ],

    // AUTO CHECK
    autoScore: {
      type: Number,
      default: 0
    },

    autoPercentage: {
      type: Number,
      default: 0
    },

    // WRITING
    writing: {
      text: {
        type: String,
        default: ""
      },
      score: {
        type: Number,
        default: null
      },
      checked: {
        type: Boolean,
        default: false
      }
    },

    // FINAL RESULT
    finalScore: {
      type: Number,
      default: null
    },

    finalPercentage: {
      type: Number,
      default: null
    },

    passed: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Result", resultSchema);
