const examSchema = new mongoose.Schema({
  title: String,
  timeLimit: Number,
  passPercentage: Number,

  questions: [questionSchema],
  grammarQuestions: [grammarSchema],
  tenseTransforms: [tenseTransformSchema]

}, { timestamps: true });
