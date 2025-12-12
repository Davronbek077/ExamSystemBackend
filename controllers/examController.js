const Exam = require("../models/exam");
const Result = require("../models/result");


// ===============================
//      CREATE EXAM
// ===============================
exports.createExam = async (req, res) => {
  try {
    let {
      title,
      timeLimit,
      passPercentage,
      questions,
      listeningTF,
      listeningGaps
    } = req.body;

    // 🔥 AUDIO URLNI TO‘G‘RI QILAMIZ
    let listeningAudio = null;

    if (req.file) {
      listeningAudio = `${req.protocol}://${req.get("host")}/uploads/listening/${req.file.filename}`;
    }

    // JSON stringlarni massivga aylantirish
    if (questions) questions = JSON.parse(questions);
    if (listeningTF) listeningTF = JSON.parse(listeningTF);
    if (listeningGaps) listeningGaps = JSON.parse(listeningGaps);

    const exam = await Exam.create({
      title,
      timeLimit,
      passPercentage,
      listeningAudio,   // ✔ To‘g‘ri URL saqlaydi
      questions,
      listeningTF,
      listeningGaps
    });

    res.status(201).json({ success: true, exam });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};




// ===============================
//      GET ALL EXAMS
// ===============================
exports.getAllExams = async (req, res) => {
  try {
    const exams = await Exam.find().sort({ createdAt: -1 });
    res.json(exams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ===============================
//      GET ONE EXAM
// ===============================
exports.getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ error: "Exam not found" });
    res.json(exam);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ===============================
//      SUBMIT EXAM
// ===============================
exports.submitExam = async (req, res) => {
  try {
    const { examId, answers } = req.body;
    const studentId = req.user._id;

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ error: "Exam not found" });

    let score = 0;


    // ===========================================
    // 1) BASIC QUESTIONS: MCQ, TRUE/FALSE, GAPFILL
    // ===========================================
    exam.questions.forEach((q) => {
      const ans = answers.find(a => a.qid === q._id.toString());
      if (!ans) return;
      if (ans.answer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
        score += q.points;
      }
    });


    // ===========================================
    // 2) LISTENING TRUE / FALSE
    // ===========================================
    exam.listeningTF.forEach((item, i) => {
      const ans = answers.find(a => a.qid === "ltf" + i);
      if (!ans) return;
      if (String(item.correct) === String(ans.answer)) score += 1;
    });


    // ===========================================
    // 3) LISTENING GAPS
    // ===========================================
    exam.listeningGaps.forEach((item, i) => {
      const ans = answers.find(a => a.qid === "lgap" + i);
      if (!ans) return;

      if (item.correctWord.trim().toLowerCase() === ans.answer.trim().toLowerCase()) {
        score += 1;
      }
    });


    // ===========================================
    // 4) GRAMMAR (WORD ORDERING)
    // ===========================================
    exam.grammarQuestions.forEach((item, i) => {
      const ans = answers.find(a => a.qid === "grammar" + i);
      if (!ans) return;

      if (item.correctSentence.trim().toLowerCase() === ans.answer.trim().toLowerCase()) {
        score += item.points || 1;
      }
    });


    // ===========================================
    // 5) TENSE TRANSFORMATION
    // ===========================================
    exam.tenseQuestions.forEach((q, qi) => {
      q.targets.forEach((t, ti) => {

        const ans = answers.find(a => a.qid === `tense${qi}_${ti}`);
        if (!ans) return;

        if (t.correct.trim().toLowerCase() === ans.answer.trim().toLowerCase()) {
          score += t.points || 1;
        }

      });
    });


    // ===============================
    //      TOTAL QUESTIONS
    // ===============================
    const total =
      exam.questions.length +
      exam.listeningTF.length +
      exam.listeningGaps.length +
      (exam.grammarQuestions?.length || 0) +
      exam.tenseQuestions.reduce((sum, q) => sum + q.targets.length, 0);


    const percentage = Math.round((score / total) * 100);
    const passed = percentage >= (exam.passPercentage || 50);


    // ===============================
    //      SAVE RESULT
    // ===============================
    const result = await Result.create({
      examId,
      studentId,
      answers,
      score,
      percentage,
      passed,
      submittedAt: new Date(),
    });

    res.status(200).json({ message: "Exam submitted", result });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
