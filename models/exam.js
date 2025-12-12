const mongoose = require("mongoose");

// Listening TF
const listeningTFSchema = new mongoose.Schema({
  statement: String,
  correct: Boolean
});

// Listening Gap Fill
const listeningGapSchema = new mongoose.Schema({
  sentence: String,
  correctWord: String
});

// Grammar (Word Ordering)
const grammarSchema = new mongoose.Schema({
  scrambledWords: String,        // aralashgan gap
  correctSentence: String,       // teacher kiritadi
  points: { type: Number, default: 1 }
});

// Tense Transformation
const tenseItemSchema = new mongoose.Schema({
  tense: String,                 // "Past Simple", "Future Simple", ...
  correctSentence: String        // to‘g‘ri shakli
});

const tenseTransformSchema = new mongoose.Schema({
  baseSentence: String,          // asosiy gap
  transforms: [tenseItemSchema], // 1–5 zamon
  points: { type: Number, default: 1 }
});

// Generic Questions: MCQ, True/False, GapFill
const questionSchema = new mongoose.Schema({
  type: { type: String, enum: ["mcq", "truefalse", "gapfill"] },
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

  questions: [questionSchema],
  grammarQuestions: [grammarSchema],
  tenseTransforms: [tenseTransformSchema]

}, { timestamps: true });

module.exports = mongoose.model("Exam", examSchema);
