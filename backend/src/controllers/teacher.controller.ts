import { Request, Response } from "express";
import { Teacher } from "../models/Teacher.model";
import { User } from "../models/User.model";
import { AuthRequest } from "../types/auth";
import { Types } from "mongoose";

/* =========================
   CREATE TEACHER
========================= */
export const createTeacher = async (req: Request, res: Response) => {
  try {
    const { userId, firstName, lastName, email, department } = req.body;

    if (!userId || !firstName || !lastName || !email || !department) {
      return res.status(400).json({
        message: "All fields including userId are required",
      });
    }

    if (!Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingTeacher = await Teacher.findOne({
      $or: [{ email: normalizedEmail }, { user: userId }],
    });

    if (existingTeacher) {
      return res.status(400).json({
        message: "Teacher already exists",
      });
    }

    const teacher = await Teacher.create({
      user: user._id,
      firstName,
      lastName,
      email: normalizedEmail,
      department,
      subjects: [],
    });

    return res.status(201).json({
      message: "Teacher created successfully",
      teacher,
    });
  } catch (error) {
    console.error("CREATE TEACHER ERROR:", error);
    return res.status(500).json({
      message: "Server error while creating teacher",
    });
  }
};

/* =========================
   GET ALL TEACHERS
========================= */
export const getAllTeachers = async (_req: Request, res: Response) => {
  try {
    const teachers = await Teacher.find()
      .populate("subjects")
      .populate("user", "email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: teachers.length,
      teachers,
    });
  } catch (error) {
    console.error("GET TEACHERS ERROR:", error);
    return res.status(500).json({
      message: "Server error while fetching teachers",
    });
  }
};

/* =========================
   GET AUTHENTICATED TEACHER PROFILE
========================= */
export const getMyTeacherProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const teacher = await Teacher.findOne({ user: req.user.id })
      .populate("subjects")
      .populate("user", "email role");

    if (!teacher) {
      return res.status(404).json({
        message: "Teacher profile not found",
      });
    }

    return res.status(200).json({ teacher });
  } catch (error) {
    console.error("GET MY TEACHER PROFILE ERROR:", error);
    return res.status(500).json({
      message: "Server error while fetching teacher profile",
    });
  }
};