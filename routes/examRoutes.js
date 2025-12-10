const express = require("express");
const router = express.Router();
const { protect, teacherOnly, studentOnly } = require("../middleware/auth");
const { 
  createExam,
  getAllExams,
  getExamById,
  submitExam
} = require("../controllers/examController");

const multer = require("multer");

// upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/listening/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });


// =============================
//         TEACHER ONLY
// =============================
router.post("/create", protect, teacherOnly, upload.single("audio"), createExam);


// =============================
//         PUBLIC ROUTES
// =============================
router.get("/all", protect, getAllExams);      // <-- frontend aynan shuni chaqiryapti
router.get("/:id", protect, getExamById);


// =============================
//     STUDENT — SUBMIT EXAM
// =============================
router.post("/submit", protect, studentOnly, submitExam);


module.exports = router;
