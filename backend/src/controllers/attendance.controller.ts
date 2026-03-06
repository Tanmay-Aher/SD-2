import Joi from "joi";
import { Response } from "express";
import { Attendance } from "../models/Attendance.model";
import { Student } from "../models/Student.model";
import { AuthRequest } from "../types/auth";
import { emitAttendanceUpdated } from "../socket";

const markAttendanceSchema = Joi.object({
  studentId: Joi.string().required(),
  subject: Joi.string().trim().min(1).required(),
  date: Joi.date().required(),
  status: Joi.string().valid("present", "absent").required(),
});

const toDayStartUtc = (date: Date): Date => {
  const normalized = new Date(date);
  normalized.setUTCHours(0, 0, 0, 0);
  return normalized;
};

const isFutureDay = (date: Date): boolean => {
  const todayStartUtc = new Date();
  todayStartUtc.setUTCHours(0, 0, 0, 0);
  return date.getTime() > todayStartUtc.getTime();
};

export const markAttendance = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { value, error } = markAttendanceSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        message: "Invalid attendance payload",
        details: error.details.map((item) => item.message),
      });
    }

    const attendanceDate = toDayStartUtc(new Date(value.date));
    if (isFutureDay(attendanceDate)) {
      return res.status(400).json({
        message: "Future dates are not allowed for attendance",
      });
    }

    const student = await Student.findById(value.studentId).select("_id user");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const existingRecord = await Attendance.findOne({
      student: student._id,
      subject: value.subject,
      date: attendanceDate,
    });

    if (
      existingRecord &&
      String(existingRecord.teacher) !== String(req.user.id)
    ) {
      return res.status(403).json({
        message: "You cannot modify attendance marked by another teacher",
      });
    }

    let attendance;
    let action: "created" | "updated" = "created";

    if (existingRecord) {
      existingRecord.status = value.status;
      existingRecord.teacher = req.user.id as any;
      attendance = await existingRecord.save();
      action = "updated";
    } else {
      try {
        attendance = await Attendance.create({
          student: student._id,
          teacher: req.user.id,
          subject: value.subject,
          date: attendanceDate,
          status: value.status,
        });
      } catch (createError: any) {
        // Handle concurrent duplicate inserts on unique index and convert to update flow.
        if (createError?.code === 11000) {
          const collidedRecord = await Attendance.findOne({
            student: student._id,
            subject: value.subject,
            date: attendanceDate,
          });

          if (!collidedRecord) {
            return res.status(409).json({
              message: "Attendance already exists for this student, subject and date",
            });
          }

          if (String(collidedRecord.teacher) !== String(req.user.id)) {
            return res.status(403).json({
              message: "You cannot modify attendance marked by another teacher",
            });
          }

          collidedRecord.status = value.status;
          collidedRecord.teacher = req.user.id as any;
          attendance = await collidedRecord.save();
          action = "updated";
        } else {
          throw createError;
        }
      }
    }

    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate("teacher", "firstName lastName email")
      .populate("student", "firstName lastName rollNumber user")
      .lean();

    emitAttendanceUpdated(String(student.user), {
      attendanceId: String(attendance._id),
      studentId: String(student._id),
      subject: attendance.subject,
      date: attendance.date,
      status: attendance.status,
      teacherId: String(req.user.id),
      updatedAt: attendance.updatedAt,
    });

    return res.status(200).json({
      message:
        action === "updated"
          ? "Attendance updated successfully"
          : "Attendance marked successfully",
      action,
      attendance: populatedAttendance,
    });
  } catch (error) {
    console.error("MARK ATTENDANCE ERROR:", error);
    return res.status(500).json({
      message: "Server error while marking attendance",
    });
  }
};

export const getMyAttendance = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const student = await Student.findOne({ user: req.user.id }).select("_id");
    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    const attendance = await Attendance.find({ student: student._id })
      .populate("teacher", "firstName lastName")
      .sort({ date: -1 })
      .lean();

    return res.status(200).json({ attendance });
  } catch (error) {
    console.error("GET MY ATTENDANCE ERROR:", error);
    return res.status(500).json({
      message: "Server error while fetching your attendance",
    });
  }
};

export const getTeacherAttendance = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const attendance = await Attendance.find({ teacher: req.user.id })
      .populate("student", "firstName lastName rollNumber")
      .sort({ date: -1 })
      .lean();

    return res.status(200).json({ attendance });
  } catch (error) {
    console.error("GET TEACHER ATTENDANCE ERROR:", error);
    return res.status(500).json({
      message: "Server error while fetching attendance",
    });
  }
};
