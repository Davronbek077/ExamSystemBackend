const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();
app.use(express.json());

// Simple diagnostics to help debugging env
const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URL || "";
if (!MONGO_URI) {
  console.error("❌ MONGO_URI (or MONGO_URL) is not set in .env");
  // exit so nodemon shows crash clearly
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.warn("⚠️ JWT_SECRET is not set in .env (needed for auth tokens)");
}

console.log("🔹 Using Mongo URI:", MONGO_URI ? "[provided]" : "[missing]");

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/exams", require("./routes/examRoutes"));
app.use("/api/results", require("./routes/resultRoutes"));

// Static folder for audio
app.use("/uploads/listening", express.static(path.join(__dirname, "uploads/listening")));

// MongoDB
mongoose.connect(MONGO_URI)
.then(() => console.log("MongoDB connected"))
.catch(err => {
  console.error("❌ MongoDB connection error:", err.message);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
