import Joi from "joi";
import { Response } from "express";
import { Types } from "mongoose";
import { Attendance } from "../models/Attendance.model";
import { Student } from "../models/Student.model";
import { Subject } from "../models/Subject.model";
import { AuthRequest } from "../types/auth";
import { emitAttendanceUpdated } from "../socket";

const saveAttendanceSchema = Joi.object({
  date: Joi.date().required(),
  classId: Joi.string().trim().required(),
  subjectId: Joi.string().required(),
  records: Joi.array()
    .items(
      Joi.object({
        studentId: Joi.string().required(),
        status: Joi.string().valid("present", "absent").required(),
      })
    )
    .default([]),
});

const queryAttendanceSchema = Joi.object({
  date: Joi.date().required(),
  classId: Joi.string().trim().required(),
  subjectId: Joi.string().required(),
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

const isObjectId = (value: string): boolean => Types.ObjectId.isValid(value);

export const saveAttendance = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { value, error } = saveAttendanceSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        message: "Invalid attendance payload",
        details: error.details.map((item) => item.message),
      });
    }

    if (!isObjectId(value.subjectId)) {
      return res.status(400).json({ message: "Invalid subject id" });
    }

    const attendanceDate = toDayStartUtc(new Date(value.date));
    if (isFutureDay(attendanceDate)) {
      return res.status(400).json({
        message: "Future dates are not allowed for attendance",
      });
    }

    const subject = await Subject.findById(value.subjectId).select("name").lean();
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    const classId = value.classId.trim();
    const studentIds = Array.from(
      new Set(value.records.map((item: { studentId: string }) => item.studentId))
    );

    const invalidStudentId = studentIds.find((id) => !isObjectId(id));
    if (invalidStudentId) {
      return res.status(400).json({ message: "Invalid student id" });
    }

    const classStudents = await Student.find({ class: classId })
      .select("_id class user")
      .lean();

    if (classStudents.length === 0) {
      return res.status(404).json({ message: "No students found for this class" });
    }

    const classStudentIds = new Set(
      classStudents.map((student: any) => String(student._id))
    );

    const invalidStudent = studentIds.find((id) => !classStudentIds.has(id));
    if (invalidStudent) {
      return res.status(400).json({
        message: "Some students do not belong to the selected class",
      });
    }

    const statusByStudent = new Map<string, "present" | "absent">();
    for (const entry of value.records) {
      statusByStudent.set(entry.studentId, entry.status);
    }

    const records = classStudents.map((student: any) => ({
      student: student._id,
      status: statusByStudent.get(String(student._id)) || "present",
    }));

    const query = {
      date: attendanceDate,
      classId,
      subjectId: value.subjectId,
      teacher: req.user.id,
    };

    let attendance = await Attendance.findOne(query);
    let action: "created" | "updated" = "created";

    if (attendance) {
      attendance.records = records as any;
      attendance.subjectName = subject.name;
      attendance = await attendance.save();
      action = "updated";
    } else {
      try {
        attendance = await Attendance.create({
          ...query,
          subjectName: subject.name,
          records,
        });
      } catch (createError: any) {
        if (createError?.code === 11000) {
          const collidedRecord = await Attendance.findOne(query);
          if (!collidedRecord) {
            return res.status(409).json({
              message: "Attendance already exists for this class and date",
            });
          }
          collidedRecord.records = records as any;
          collidedRecord.subjectName = subject.name;
          attendance = await collidedRecord.save();
          action = "updated";
        } else {
          throw createError;
        }
      }
    }

    const studentUserMap = new Map(
      classStudents.map((student: any) => [String(student._id), String(student.user)])
    );

    for (const entry of records) {
      const studentUserId = studentUserMap.get(String(entry.student));
      if (!studentUserId) {
        continue;
      }
      emitAttendanceUpdated(studentUserId, {
        attendanceId: String(attendance._id),
        studentId: String(entry.student),
        subject: subject.name,
        date: attendance.date,
        status: entry.status,
        teacherId: String(req.user.id),
        updatedAt: attendance.updatedAt,
      });
    }

    const normalized = {
      ...attendance.toObject(),
      records: attendance.records.map((record: any) => ({
        studentId: String(record.student),
        status: record.status,
      })),
    };

    return res.status(200).json({
      message:
        action === "updated"
          ? "Attendance updated successfully"
          : "Attendance saved successfully",
      action,
      attendance: normalized,
    });
  } catch (error) {
    console.error("SAVE ATTENDANCE ERROR:", error);
    return res.status(500).json({
      message: "Server error while saving attendance",
    });
  }
};

export const getAttendanceForDate = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { value, error } = queryAttendanceSchema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        message: "Invalid attendance query",
        details: error.details.map((item) => item.message),
      });
    }

    if (!isObjectId(value.subjectId)) {
      return res.status(400).json({ message: "Invalid subject id" });
    }

    const attendanceDate = toDayStartUtc(new Date(value.date));

    const attendance = await Attendance.findOne({
      date: attendanceDate,
      classId: value.classId,
      subjectId: value.subjectId,
      teacher: req.user.id,
    })
      .select("date classId subjectId subjectName records")
      .lean();

    const normalized = attendance
      ? {
          ...attendance,
          records: attendance.records.map((record: any) => ({
            studentId: String(record.student),
            status: record.status,
          })),
        }
      : null;

    return res.status(200).json({ attendance: normalized });
  } catch (error) {
    console.error("GET ATTENDANCE BY DATE ERROR:", error);
    return res.status(500).json({
      message: "Server error while fetching attendance",
    });
  }
};

export const getMyAttendance = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const student = await Student.findOne({ user: req.user.id }).select("_id").lean();
    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    const attendance = await Attendance.aggregate([
      { $match: { "records.student": student._id } },
      { $unwind: "$records" },
      { $match: { "records.student": student._id } },
      {
        $lookup: {
          from: "users",
          localField: "teacher",
          foreignField: "_id",
          as: "teacher",
        },
      },
      { $unwind: { path: "$teacher", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: {
            $concat: [
              { $toString: "$_id" },
              ":",
              { $toString: "$records.student" },
            ],
          },
          subject: "$subjectName",
          date: "$date",
          status: "$records.status",
          updatedAt: "$updatedAt",
          teacher: {
            _id: "$teacher._id",
            firstName: "$teacher.firstName",
            lastName: "$teacher.lastName",
          },
        },
      },
      { $sort: { date: -1 } },
    ]);

    return res.status(200).json({ attendance });
  } catch (error) {
    console.error("GET MY ATTENDANCE ERROR:", error);
    return res.status(500).json({
      message: "Server error while fetching your attendance",
    });
  }
};

export const getTeacherAttendance = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const attendance = await Attendance.aggregate([
      { $match: { teacher: new Types.ObjectId(req.user.id) } },
      { $unwind: "$records" },
      {
        $lookup: {
          from: "students",
          localField: "records.student",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: { path: "$student", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: {
            $concat: [
              { $toString: "$_id" },
              ":",
              { $toString: "$records.student" },
            ],
          },
          student: {
            _id: "$student._id",
            firstName: "$student.firstName",
            lastName: "$student.lastName",
            rollNumber: "$student.rollNumber",
          },
          subject: "$subjectName",
          date: "$date",
          status: "$records.status",
          updatedAt: "$updatedAt",
        },
      },
      { $sort: { date: -1 } },
    ]);

    return res.status(200).json({ attendance });
  } catch (error) {
    console.error("GET TEACHER ATTENDANCE ERROR:", error);
    return res.status(500).json({
      message: "Server error while fetching attendance",
    });
  }
};
