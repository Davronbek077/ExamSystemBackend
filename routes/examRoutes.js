const express = require("express");
const router = express.Router();
const { protect, teacherOnly, studentOnly } = require("../middleware/auth");
const { createExam } = require("../controllers/examController");
const multer = require("multer");

// upload config (you can keep your path)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/listening/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

router.post("/create", protect, teacherOnly, upload.single("audio"), createExam);

module.exports = router;
