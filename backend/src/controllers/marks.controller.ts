import Joi from "joi";
import { Response } from "express";
import { AuthRequest } from "../types/auth";
import { Marks } from "../models/Marks.model";
import { Student } from "../models/Student.model";
import { Teacher } from "../models/Teacher.model";
import { Subject } from "../models/Subject.model";
import { User } from "../models/User.model";

const updateMarksSchema = Joi.object({
  studentId: Joi.string().required(),
  subject: Joi.string().trim().min(1).required(),
  ct1: Joi.number().min(0).max(30).required(),
  ct2: Joi.number().min(0).max(30).required(),
});

export const updateMarks = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { value, error } = updateMarksSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        message: "Invalid marks payload",
        details: error.details.map((item) => item.message),
      });
    }

    const [student, teacher] = await Promise.all([
      Student.findById(value.studentId).select("_id class"),
      Teacher.findOne({ user: req.user.id }).select("_id"),
    ]);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!teacher) {
      return res.status(404).json({ message: "Teacher profile not found" });
    }

    const marks = await Marks.findOneAndUpdate(
      { student: student._id, subject: value.subject },
      {
        $set: {
          teacher: teacher._id,
          class: student.class,
          ct1: value.ct1,
          ct2: value.ct2,
        },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    )
      .populate("student", "firstName lastName rollNumber class")
      .populate("teacher", "firstName lastName email")
      .lean();

    return res.status(200).json({
      message: "Marks saved successfully",
      marks,
    });
  } catch (error) {
    console.error("UPDATE MARKS ERROR:", error);
    return res.status(500).json({
      message: "Server error while updating marks",
    });
  }
};

export const getStudentMarks = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findOne({ email: req.user.email })
      .select("_id")
      .lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const student = await Student.findOne({ user: user._id }).select("_id").lean();
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    const marks = await Marks.find({ student: student._id })
      .populate("teacher", "firstName lastName email")
      .sort({ subject: 1 })
      .lean();

    return res.status(200).json({ marks });
  } catch (error) {
    console.error("GET STUDENT MARKS ERROR:", error);
    return res.status(500).json({
      message: "Server error while fetching marks",
    });
  }
};

export const getStudentSubjectProgressForTeacher = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { studentId } = req.params;
    if (!studentId) {
      return res.status(400).json({ message: "Student id is required" });
    }

    const teacher = await Teacher.findOne({ user: req.user.id })
      .select("subjects")
      .lean();
    if (!teacher) {
      return res.status(404).json({ message: "Teacher profile not found" });
    }

    const assignedSubjectId = teacher.subjects?.[0];
    if (!assignedSubjectId) {
      return res.status(404).json({ message: "No subject assigned to teacher" });
    }

    const [student, subject] = await Promise.all([
      Student.findById(studentId)
        .select("firstName lastName rollNumber class")
        .lean(),
      Subject.findById(assignedSubjectId).select("name").lean(),
    ]);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!subject) {
      return res.status(404).json({ message: "Assigned subject not found" });
    }

    const marks = await Marks.findOne({
      student: studentId,
      subject: subject.name,
    })
      .select("subject ct1 ct2 updatedAt")
      .lean();

    const ct1 = Number(marks?.ct1 ?? 0);
    const ct2 = Number(marks?.ct2 ?? 0);
    const total = ct1 + ct2;
    const maxTotal = 60;
    const percentage = Number(((total / maxTotal) * 100).toFixed(2));

    return res.status(200).json({
      student,
      progress: {
        subject: subject.name,
        ct1,
        ct2,
        total,
        maxTotal,
        percentage,
        hasMarks: Boolean(marks),
        updatedAt: marks?.updatedAt ?? null,
      },
    });
  } catch (error) {
    console.error("GET STUDENT SUBJECT PROGRESS ERROR:", error);
    return res.status(500).json({
      message: "Server error while fetching student subject progress",
    });
  }
};
