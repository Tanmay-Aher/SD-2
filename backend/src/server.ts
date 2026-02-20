import dotenv from "dotenv";
dotenv.config();

import express from "express";
import connectDB from "./config/database";

import authRoutes from "./routes/auth";

const app = express();

// 🔴 VERY IMPORTANT — body parser MUST be before routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);

// Health check
app.get("/", (req, res) => {
  res.status(200).json({ message: "EduDash API running 🚀" });
});

// DB
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
