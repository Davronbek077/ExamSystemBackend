const express = require("express");
const router = express.Router();
const multer = require("multer");
const { createExam, getAllExams, getExamById, submitExam } = require("../controllers/examController");

// Multer upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/listening/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// =============================
//       CREATE EXAM (PUBLIC)
// =============================
router.post("/create", upload.single("audio"), createExam);

// =============================
//       GET EXAMS (PUBLIC)
// =============================
router.get("/all", getAllExams);      // <-- frontend aynan shuni chaqiryapti
router.get("/:id", getExamById);

// =============================
//       SUBMIT EXAM (PUBLIC)
// =============================
router.post("/submit", submitExam);

module.exports = router;
