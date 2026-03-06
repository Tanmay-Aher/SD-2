import { Request, Response } from "express";
import { Student } from "../models/Student.model";
import { AuthRequest } from "../types/auth";

/* =========================
   GET ALL STUDENTS (TEACHER)
   GET /api/students
========================= */
export const getAllStudents = async (_req: Request, res: Response) => {
  try {
    const students = await Student.find()
      .populate("user", "email")
      .select("firstName lastName rollNumber class user")
      .sort({ rollNumber: 1 })
      .lean();

    const formattedStudents = students.map((student: any) => ({
      id: String(student._id),
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.user?.email || "",
      rollNumber: student.rollNumber,
      class: student.class,
    }));

    return res.status(200).json({ students: formattedStudents });
  } catch (error) {
    console.error("GET ALL STUDENTS ERROR:", error);
    return res.status(500).json({
      message: "Server error while fetching students",
    });
  }
};

/* =========================
   GET STUDENTS BY CLASS (TEACHER)
   GET /api/students/class/:className
========================= */
export const getStudentsByClass = async (
  req: Request,
  res: Response
) => {
  try {
    const { className } = req.params;

    const students = await Student.find({ class: className })
      .populate("user", "email")
      .select("firstName lastName rollNumber class user")
      .sort({ rollNumber: 1 })
      .lean();

    return res.status(200).json({ students });
  } catch (error) {
    console.error("GET STUDENTS BY CLASS ERROR:", error);
    return res.status(500).json({
      message: "Server error while fetching students by class",
    });
  }
};

/* =========================
   GET LOGGED-IN STUDENT PROFILE
   GET /api/students/me
========================= */
export const getMyStudentProfile = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    // ✅ Correct lookup: Student → user ObjectId
    const student = await Student.findOne({
      user: req.user.id,
    })
      .populate("user", "email")
      .lean();

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    return res.status(200).json({ student });
  } catch (error) {
    console.error("GET MY STUDENT PROFILE ERROR:", error);
    return res.status(500).json({
      message: "Server error while fetching student profile",
    });
  }
};