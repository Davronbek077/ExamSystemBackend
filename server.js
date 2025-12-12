const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const fs = require("fs");

// Load ENV
dotenv.config();

const app = express();

// === CORS ===
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Form-data (multer) + JSON uchun kerak
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// === UPLOADS PAPKASINI YARATIB QO‘YAMIZ (muammo shu edi) ===
const uploadsPath = path.join(__dirname, "uploads/listening");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log("📁 uploads/listening papkasi yaratildi");
}

// Static route (AUDIO ishlashi uchun)
app.use(
  "/uploads/listening",
  express.static(path.join(__dirname, "uploads/listening"))
);

// ==== ENV TEKSHIRISH ====
const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URL;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is not defined in .env!");
  process.exit(1);
}

// ==== ROUTES ====
app.use("/exams", require("./routes/examRoutes"));
app.use("/results", require("./routes/resultRoutes"));

// ==== MONGO CONNECT ====
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  });

// ==== START SERVER ====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
