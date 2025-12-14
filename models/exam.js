const mongoose = require("mongoose");

// Grammar
const grammarSchema = new mongoose.Schema({
  scrambledWords: String,
  correctSentence: String,
  points: { type: Number, default: 1 }
});

// Tense
const tenseItemSchema = new mongoose.Schema({
  tense: String,
  correctSentence: String
});

const tenseTransformSchema = new mongoose.Schema({
  baseSentence: String,
  transforms: [tenseItemSchema],
  points: { type: Number, default: 1 }
});

// Basic questions
const questionSchema = new mongoose.Schema({
  type: { type: String, enum: ["mcq", "truefalse", "gapfill, grammar, tense"] },
  questionText: String,
  options: [String],
  correctAnswer: String,
  points: { type: Number, default: 1 }
});

const examSchema = new mongoose.Schema({
  title: { type: String, required: true },
  timeLimit: Number,
  passPercentage: Number,

  questions: [questionSchema],
  grammarQuestions: [grammarSchema],
  tenseTransforms: [tenseTransformSchema]

}, { timestamps: true });

module.exports = mongoose.model("Exam", examSchema);
