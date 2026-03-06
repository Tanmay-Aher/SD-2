import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import http from "http";

import express from "express";
import connectDB from "./config/database";
import subjectRoutes from "./routes/subject.routes";
import testRoutes from "./routes/test.routes";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/users.routes.js";
import studentRoutes from "./routes/student.routes";
import teacherRoutes from "./routes/teacher.routes";
import teacherSubjectRoutes from "./routes/teacherSubject.routes";
import attendanceRoutes from "./routes/attendance.routes";
import assignmentRoutes from "./routes/assignment.routes";
import announcementRoutes from "./routes/announcement.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import marksRoutes from "./routes/marks.routes";
import { initSocket } from "./socket";

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/test", testRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/teacher-subject", teacherSubjectRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/marks", marksRoutes);

app.get("/", (_req, res) => {
  res.status(200).json({ message: "EduDash API running" });
});

connectDB();

const PORT = process.env.PORT || 6000;
const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
