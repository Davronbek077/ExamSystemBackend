const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const {
  createExam,
  getAllExams,
  getExamById,
  submitExam
} = require("../controllers/examController");


// LISTENING papkasini avtomatik yaratish
const uploadPath = path.join(__dirname, "..", "uploads/listening");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
  console.log("📁 listening papkasi yaratildi");
}


// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-listening" + path.extname(file.originalname));
  },
});

const upload = multer({ storage });


// =============================
// CREATE EXAM
// =============================
router.post("/create", upload.single("audio"), createExam);

// =============================
// GET EXAMS
// =============================
router.get("/all", getAllExams);
router.get("/:id", getExamById);

// =============================
// SUBMIT EXAM
// =============================
router.post("/submit", submitExam);

module.exports = router;
