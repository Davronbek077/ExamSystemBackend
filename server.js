const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const fs = require("fs");

dotenv.config();
const app = express();

// ================== CORS ==================
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// ================== BODY ==================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =============================
// LISTENING AUDIO (RENDER TMP)
// =============================
const AUDIO_DIR = "/opt/render/project/tmp/uploads";

// papka mavjud bo‘lmasa yaratamiz
if (!fs.existsSync(AUDIO_DIR)) {
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
  console.log("📁 Audio papka yaratildi:", AUDIO_DIR);
}

// =============================
// AUDIO STREAM ROUTE
// =============================
app.get("/audio/:filename", (req, res) => {
  const filePath = path.join(AUDIO_DIR, req.params.filename);

  if (!fs.existsSync(filePath)) {
    console.log("❌ Audio topilmadi:", filePath);
    return res.sendStatus(404);
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    const chunkSize = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "audio/mpeg",
    });

    file.pipe(res);
  } else {
    res.writeHead(200, {
      "Content-Length": fileSize,
      "Content-Type": "audio/mpeg",
    });

    fs.createReadStream(filePath).pipe(res);
  }
});

// ================== ROUTES ==================
app.use("/exams", require("./routes/examRoutes"));
app.use("/results", require("./routes/resultRoutes"));

// ================== MONGO ==================
const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URL;

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// ================== START ==================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
