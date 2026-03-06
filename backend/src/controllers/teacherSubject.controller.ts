import { Request, Response } from "express";
import { Types } from "mongoose";
import { Teacher } from "../models/Teacher.model";
import { Subject } from "../models/Subject.model";
import { User } from "../models/User.model";

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

    // Auto-repair legacy teacher profiles that were created without user linkage.
    if (!(teacher as any).user) {
      const linkedUser = await User.findOne({
        email: teacher.email.trim().toLowerCase(),
      }).select("_id role");

      if (!linkedUser) {
        return res.status(400).json({
          message:
            "Teacher profile is missing linked user. Create or link a user account first.",
        });
      }

      (teacher as any).user = linkedUser._id;
      await teacher.save();

      if (linkedUser.role !== "teacher") {
        linkedUser.role = "teacher";
        await linkedUser.save();
      }
    }

    // Use atomic updates to avoid full-document validation side effects.
    await Teacher.updateOne(
      { _id: teacher._id },
      { $addToSet: { subjects: subject._id } }
    );
    await Subject.updateOne(
      { _id: subject._id },
      { $addToSet: { teachers: teacher._id } }
    );

    const updatedTeacher = await Teacher.findById(teacherId)
      .populate("subjects")
      .populate("user", "email role");

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
