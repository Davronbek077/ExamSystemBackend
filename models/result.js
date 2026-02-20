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

    studentLevel: {
      type: String,
      default: null
    },

    levelStats: {
      type: Object,
      default: {}
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

    autoMaxScore: {
      type: Number,
      default: 0
    },

    status: {
      type: String,
      enum: ["pending", "passed", "failed"],
      default: "pending"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Result", resultSchema);
