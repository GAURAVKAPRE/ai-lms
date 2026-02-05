// ================= LOAD ENV =================
import "./config/env.js";

// ================= IMPORTS =================
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

// ================= LOCAL IMPORTS =================
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import instructorRoutes from "./routes/instructorRoutes.js";

import lectureProgressRoutes from "./routes/lectureProgressRoutes.js";
import adviceRoutes from "./routes/adviceRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import quizAttemptRoutes from "./routes/quizAttemptRoutes.js";
import lectureRoutes from "./routes/lectureRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
// ================= CONNECT DB =================
await connectDB();

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
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/instructor", instructorRoutes);

app.use("/api/progress", lectureProgressRoutes);
app.use("/api/advice", adviceRoutes);
app.use("/api/ai", aiRoutes);

app.use("/api/quizzes", quizRoutes);
app.use("/api/quiz-attempts", quizAttemptRoutes);

app.use("/api/payments", paymentRoutes);

// 🔥 Lecture routes
app.use("/api", lectureRoutes);

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
