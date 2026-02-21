const mongoose = require("mongoose");

const LEVELS = [
  "Beginner",
  "Elementary",
  "Pre-intermediate",
  "Pre-IELTS",
  "IELTS-Foundation",
  "IELTS-Max"
];

// ===== BASIC QUESTION =====
const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["mcq", "truefalse", "gapfill"]
  },
  level: { type: String, enum: LEVELS, default: "Beginner" },
  questionText: String,
  options: [String],
  correctAnswer: String,
  points: { type: Number, default: 1 }
});

// ===== GRAMMAR =====
const grammarSchema = new mongoose.Schema({
  level: { type: String, enum: LEVELS, default: "Beginner" },
  scrambledWords: String,
  correctSentence: String,
  points: { type: Number, default: 1 }
});

// ===== TENSE =====
const tenseItemSchema = new mongoose.Schema({
  level: { type: String, enum: LEVELS, default: "Beginner" },
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
  level: { type: String, enum: LEVELS, default: "Beginner" },
  statement: String,
  correct: Boolean,
  points: {type: Number, default: 1}
});

const listeningGapSchema = new mongoose.Schema({
  level: { type: String, enum: LEVELS, default: "Beginner" },
  sentence: String,
  correctWord: String,
  points: {type: Number, default: 1}
});

const ReadingSchema = new mongoose.Schema({
  instruction: String,
  passage: String,

  tfQuestions: [
    {
      level: { type: String, enum: LEVELS, default: "Beginner" },
      statement: String,
      correct: {
        type: String,
        enum: ["true", "false", "not_given"]
      }
    }
  ],

  gapQuestions: [
    {
      level: { type: String, enum: LEVELS, default: "Beginner" },
      sentence: String,
      correctWord: String
    }
  ],

  shortAnswerQuestions: [   // 🔥 YANGI
    {
      level: { type: String, enum: LEVELS, default: "Beginner" },
      question: String,
      keywords: [String],
      maxPoints: Number
    }
  ],

  translationQuestions: [
    {
      level: { type: String, enum: LEVELS, default: "Beginner" },
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
  level: {type: String, enum: LEVELS, default: "Beginner" },
  word: String,
  correctAnswer: String,
  points: {type: Number, default: 1}
});

const completeSentenceSchema = new mongoose.Schema({
  level: { type: String, enum: LEVELS, default: "Beginner" },
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
  level: { type: String, enum: LEVELS, default: "Beginner" },
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
  level: { type: String, enum: LEVELS, default: "Beginner" },
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
