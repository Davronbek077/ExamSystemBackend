const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const fs = require("fs");

dotenv.config();
const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =============================
//  LISTENING UPLOADS (RENDER)
// =============================
const uploadsFolder = "/opt/render/project/tmp/uploads/listening";

if (!fs.existsSync(uploadsFolder)) {
  fs.mkdirSync(uploadsFolder, { recursive: true });
  console.log("📁 TMP listening papkasi yaratildi");
}

// Static (student audio o‘qishi uchun)
app.use(
  "/uploads",
  express.static("/opt/render/project/tmp/uploads", {
    setHeaders: (res, path) => {
      if (path.endsWith(".mp3")) {
        res.set("Content-Type", "audio/mpeg");
      }
    }
  })
);

// ===== ROUTES =====
app.use("/exams", require("./routes/examRoutes"));
app.use("/results", require("./routes/resultRoutes"));

// ===== MONGO =====
const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URL;
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
