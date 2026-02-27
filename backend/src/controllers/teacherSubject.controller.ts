import { Request, Response } from "express";
import { Types } from "mongoose";
import { Teacher } from "../models/Teacher.model";
import { Subject } from "../models/Subject.model";

export const assignSubjectToTeacher = async (
  req: Request,
  res: Response
) => {
  try {
    const { teacherId, subjectId } = req.body;

    if (!teacherId || !subjectId) {
      return res.status(400).json({
        message: "teacherId and subjectId are required",
      });
    }

    if (
      !Types.ObjectId.isValid(teacherId) ||
      !Types.ObjectId.isValid(subjectId)
    ) {
      return res.status(400).json({
        message: "Invalid teacherId or subjectId",
      });
    }

    const teacher = await Teacher.findById(teacherId);
    const subject = await Subject.findById(subjectId);

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    const teacherHasSubject = teacher.subjects.some(
      (id) => id.toString() === subjectId
    );

    if (!teacherHasSubject) {
      teacher.subjects.push(subject._id);
    }

    const subjectHasTeacher = subject.teachers.some(
      (id) => id.toString() === teacherId
    );

    if (!subjectHasTeacher) {
      subject.teachers.push(teacher._id);
    }

    await teacher.save();
    await subject.save();

    const updatedTeacher = await Teacher.findById(teacherId).populate("subjects");

    return res.status(200).json({
      message: "Subject assigned successfully",
      teacher: updatedTeacher,
    });
  } catch (error) {
    console.error("ASSIGN SUBJECT ERROR:", error);
    return res.status(500).json({
      message: "Server error while assigning subject",
    });
  }
};