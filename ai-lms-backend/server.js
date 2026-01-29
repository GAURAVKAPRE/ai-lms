// ================= LOAD ENV =================
const dotenv = require("dotenv");
dotenv.config();

// ================= IMPORTS =================
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const connectDB = require("./config/db");
const lectureProgressRoutes = require("./routes/lectureProgressRoutes");

// ================= CONNECT DB =================
connectDB();

// ================= INIT APP =================
const app = express();

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(cors());

// ================= TEST ROUTE =================
app.get("/", (req, res) => {
  res.send("AI LMS Backend is running 🚀");
});

// ================= ROUTES =================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/courses", require("./routes/courseRoutes"));
app.use("/api/instructor", require("./routes/instructorRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

app.use("/api/progress", lectureProgressRoutes);
app.use("/api/advice", require("./routes/adviceRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));

app.use("/api/quizzes", require("./routes/quizRoutes"));
app.use("/api/quiz-attempts", require("./routes/quizAttemptRoutes"));

// 🔥 Lecture routes
app.use("/api", require("./routes/lectureRoutes"));

// ================= OPTIONAL TEST =================
app.post("/api/test", (req, res) => {
  res.json({ message: "Server works!" });
});

// ================= GLOBAL ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err);
  res.status(500).json({ message: "Something went wrong!" });
});

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("DB NAME:", mongoose.connection.name);
  console.log(`🚀 Server running on port ${PORT}`);
});
