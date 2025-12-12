const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// CONTROLLERS
const {
  createExam,
  getAllExams,
  getExamById,
  submitExam
} = require("../controllers/examController");

// LISTENING papkasi (Render faqat tmp ga yozishga ruxsat beradi)
const uploadPath = "/opt/render/project/tmp/uploads/listening";

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
  console.log("📁 tmp listening papkasi yaratildi");
}

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-listening" + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// CREATE EXAM
router.post("/create", upload.single("listeningAudio"), createExam);

// GET EXAMS
router.get("/all", getAllExams);
router.get("/:id", getExamById);

// SUBMIT
router.post("/submit", submitExam);

module.exports = router;
