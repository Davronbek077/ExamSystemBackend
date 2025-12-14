const mongoose = require("mongoose");

// ==================
// BASIC QUESTIONS
// ==================
const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["mcq", "truefalse", "gapfill", "grammar", "tense"],
    required: true
  },
  questionText: String,
  options: [String],
  correctAnswer: String,
  points: { type: Number, default: 1 }
});

// ==================
// GRAMMAR
// ==================
const grammarSchema = new mongoose.Schema({
  scrambledWords: String,
  correctSentence: String,
  points: { type: Number, default: 1 }
});

// ==================
// TENSE
// ==================
const tenseItemSchema = new mongoose.Schema({
  tense: String,
  correctSentence: String,
  points: { type: Number, default: 1 }
});

const tenseTransformSchema = new mongoose.Schema({
  baseSentence: String,
  transforms: [tenseItemSchema],
  points: { type: Number, default: 1 }
});

// ==================
// LISTENING
// ==================
const listeningTFSchema = new mongoose.Schema({
  statement: String,
  correct: Boolean
});

const listeningGapSchema = new mongoose.Schema({
  sentence: String,
  correctWord: String
});

// ==================
// EXAM
// ==================
const examSchema = new mongoose.Schema({
  title: { type: String, required: true },
  timeLimit: Number,
  passPercentage: Number,

  questions: [questionSchema],
  grammarQuestions: [grammarSchema],
  tenseTransforms: [tenseTransformSchema],

  // 👇 LISTENING QOLADI
  listeningTF: [listeningTFSchema],
  listeningGaps: [listeningGapSchema]

}, { timestamps: true });

module.exports = mongoose.model("Exam", examSchema);
