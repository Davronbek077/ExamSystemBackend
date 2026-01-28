const mongoose = require("mongoose");

// ===== BASIC QUESTION =====
const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["mcq", "truefalse", "gapfill"]
  },
  questionText: String,
  options: [String],
  correctAnswer: String,
  points: { type: Number, default: 1 }
});

// ===== GRAMMAR =====
const grammarSchema = new mongoose.Schema({
  scrambledWords: String,
  correctSentence: String,
  points: { type: Number, default: 1 }
});

// ===== TENSE =====
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

// ===== LISTENING =====
const listeningTFSchema = new mongoose.Schema({
  statement: String,
  correct: Boolean
});

const listeningGapSchema = new mongoose.Schema({
  sentence: String,
  correctWord: String
});

const ReadingSchema = new mongoose.Schema({
  instruction: String,
  passage: String,

  tfQuestions: [
    {
      statement: String,
      correct: {
        type: String,
        enum: ["true", "false", "not_given"]
      }
    }
  ],

  gapQuestions: [
    {
      sentence: String,
      correctWord: String
    }
  ],

  shortAnswerQuestions: [   // 🔥 YANGI
    {
      question: String,
      keywords: [String],
      maxPoints: Number
    }
  ],

  translationQuestions: [
    {
      sentence: String,
      correctAnswer: String,
      points: Number
    }
  ],

  pointsPerQuestion: {
    type: Number,
    default: 1
  }
});

const translateSchema = new mongoose.Schema({
  word: String,
  correctAnswer: String,
  points: {type: Number, default: 1}
});

const completeSentenceSchema = new mongoose.Schema({
  text: String,
  correctWord: String
});

const completeSchema = new mongoose.Schema({
  wordBank: [String],
  sentences: [completeSentenceSchema],
  pointsPerSentence: {
    type: Number,
    default: 1
  }
});

const sentenceBuildQuestions = new mongoose.Schema({
  words: {
    type: [String],
    required: true
  },
  affirmative: {
    type: String,
    required: true
  },
  negative: {
    type: String,
    required: true
  },
  question: {
    type: String,
    required: true
  },
  points: {
    type: Number,
    default: 3
  }
});

const correctionSchema = new mongoose.Schema({
  wrongSentence: String,
  correctSentence: String,
  points: { type: Number, default: 1 }
});

const writingSchema = new mongoose.Schema({
  title: String,
  instruction: String,
  minWords: Number,
  maxWords: Number,
  points: Number
});


// ===== EXAM =====
const examSchema = new mongoose.Schema({
  title: { type: String, required: true },
  timeLimit: Number,
  passPercentage: Number,

  questions: [questionSchema],
  grammarQuestions: [grammarSchema],
  tenseTransforms: [tenseTransformSchema],

  listeningTF: [listeningTFSchema],
  listeningGaps: [listeningGapSchema],
  reading: ReadingSchema,

  translateQuestions: [translateSchema],
  completeQuestions: [completeSchema],
  correctionQuestions: [correctionSchema],
  sentenceBuildQuestions: [sentenceBuildQuestions],
  writingTask: writingSchema,
  level: {
    type: String,
    required: true,
    enum: [
      "Beginner",
      "Elementary",
      "Pre-intermediate",
      "Pre-IELTS",
      "IELTS-Foundation",
      "IELTS-Max"
    ]
  }

}, { timestamps: true });

module.exports = mongoose.model("Exam", examSchema);
