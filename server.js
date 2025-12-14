const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");

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

// ================== STATIC AUDIO ==================
// audio fayllar /audio papkadan beriladi
app.use("/audio", express.static(path.join(__dirname, "audio")));

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
