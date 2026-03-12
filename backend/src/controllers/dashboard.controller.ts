import { Response } from "express";
import { Types } from "mongoose";
import { Attendance } from "../models/Attendance.model";
import { Assignment, AssignmentSubmission } from "../models/Assignment.model";
import { Student } from "../models/Student.model";
import { Teacher } from "../models/Teacher.model";
import { Subject } from "../models/Subject.model";
import { Announcement } from "../models/Announcement.model";
import { AuthRequest } from "../types/auth";

type MonthSlot = {
  key: string;
  label: string;
  start: Date;
  end: Date;
};

const normalizeDepartment = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

const extractDepartmentCore = (value: string) =>
  normalizeDepartment(value)
    .replace(
      /\b(fy|sy|ty|fe|se|te|be|year|semester|sem|class|section|div|division)\b/g,
      " "
    )
    .replace(/\b\d+\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const departmentMatches = (left: string, right: string) => {
  const a = extractDepartmentCore(left);
  const b = extractDepartmentCore(right);
  if (!a || !b) {
    return false;
  }
  return a === b || a.includes(b) || b.includes(a);
};

const round = (value: number) => Math.round(value);

const buildLastMonths = (count = 6): MonthSlot[] => {
  const now = new Date();
  const months: MonthSlot[] = [];
  for (let offset = count - 1; offset >= 0; offset -= 1) {
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1));
    const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1));
    months.push({
      key: `${start.getUTCFullYear()}-${String(start.getUTCMonth() + 1).padStart(2, "0")}`,
      label: start.toLocaleString("en-US", { month: "short", timeZone: "UTC" }),
      start,
      end,
    });
  }
  return months;
};

const monthKeyFromDate = (value: Date) =>
  `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, "0")}`;

export const getStudentOverview = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const student = await Student.findOne({ user: req.user.id }).select("_id").lean();
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    const [attendanceRecords, submissions] = await Promise.all([
      Attendance.aggregate([
        { $match: { "records.student": student._id } },
        { $unwind: "$records" },
        { $match: { "records.student": student._id } },
        { $project: { date: "$date", status: "$records.status" } },
      ]),
      AssignmentSubmission.find({ student: student._id })
        .select("status assignment")
        .populate("assignment", "subject")
        .lean(),
    ]);

    const months = buildLastMonths();
    const monthMap = new Map<string, { present: number; total: number }>();
    for (const month of months) {
      monthMap.set(month.key, { present: 0, total: 0 });
    }

    for (const record of attendanceRecords as Array<{ date: Date; status: "present" | "absent" }>) {
      const key = monthKeyFromDate(new Date(record.date));
      const bucket = monthMap.get(key);
      if (!bucket) {
        continue;
      }
      bucket.total += 1;
      if (record.status === "present") {
        bucket.present += 1;
      }
    }

    const attendanceTrend = months.map((month) => {
      const bucket = monthMap.get(month.key)!;
      const rate = bucket.total > 0 ? round((bucket.present / bucket.total) * 100) : 0;
      return { month: month.label, rate };
    });

    const subjectMap = new Map<string, { total: number; completed: number }>();
    let pendingAssignments = 0;
    let completedAssignments = 0;

    for (const submission of submissions as Array<{ status: "pending" | "completed"; assignment?: { subject?: string } }>) {
      const subjectName = submission.assignment?.subject || "General";
      const current = subjectMap.get(subjectName) || { total: 0, completed: 0 };
      current.total += 1;
      if (submission.status === "completed") {
        current.completed += 1;
        completedAssignments += 1;
      } else {
        pendingAssignments += 1;
      }
      subjectMap.set(subjectName, current);
    }

    const subjectPerformance = Array.from(subjectMap.entries())
      .map(([subject, value]) => ({
        subject,
        score: value.total > 0 ? round((value.completed / value.total) * 100) : 0,
      }))
      .sort((a, b) => b.score - a.score);

    const totalAttendance = attendanceRecords.length;
    const presentAttendance = attendanceRecords.filter(
      (record: any) => record.status === "present"
    ).length;
    const attendanceRate =
      totalAttendance > 0 ? round((presentAttendance / totalAttendance) * 100) : 0;

    return res.status(200).json({
      stats: {
        attendanceRate,
        pendingAssignments,
        completedAssignments,
      },
      charts: {
        attendanceTrend,
        subjectPerformance,
      },
    });
  } catch (error) {
    console.error("GET STUDENT OVERVIEW ERROR:", error);
    return res.status(500).json({
      message: "Server error while fetching student overview",
    });
  }
};

export const getTeacherOverview = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const teacher = await Teacher.findOne({ user: req.user.id })
      .select("_id department")
      .lean();

    if (!teacher) {
      return res.status(404).json({ message: "Teacher profile not found" });
    }

    const students = await Student.find()
      .select("_id class")
      .lean();
    const matchedStudents = students.filter((student) =>
      departmentMatches(student.class, teacher.department)
    );
    const studentIds = matchedStudents.map((student) => student._id);

    const [attendanceRecords, teacherAssignments] = await Promise.all([
      Attendance.aggregate([
        { $match: { teacher: new Types.ObjectId(req.user.id) } },
        { $unwind: "$records" },
        ...(studentIds.length > 0
          ? [{ $match: { "records.student": { $in: studentIds } } }]
          : []),
        {
          $project: {
            student: "$records.student",
            date: "$date",
            status: "$records.status",
          },
        },
      ]),
      Assignment.find({ teacher: req.user.id }).select("_id").lean(),
    ]);

    const assignmentIds = teacherAssignments.map((assignment) => assignment._id);
    const submissions =
      assignmentIds.length > 0
        ? await AssignmentSubmission.find({ assignment: { $in: assignmentIds } })
            .select("assignment status")
            .lean()
        : [];

    const presentCount = attendanceRecords.filter(
      (record: any) => record.status === "present"
    ).length;
    const avgAttendance =
      attendanceRecords.length > 0 ? round((presentCount / attendanceRecords.length) * 100) : 0;

    const completedSubmissions = submissions.filter(
      (submission: any) => submission.status === "completed"
    ).length;
    const completionRate =
      submissions.length > 0 ? round((completedSubmissions / submissions.length) * 100) : 0;

    const pendingAssignmentSet = new Set<string>();
    for (const submission of submissions as any[]) {
      if (submission.status === "pending") {
        pendingAssignmentSet.add(String(submission.assignment));
      }
    }

    const months = buildLastMonths();
    const monthlyStudentMap = new Map<
      string,
      Map<string, { present: number; total: number }>
    >();
    for (const month of months) {
      monthlyStudentMap.set(month.key, new Map());
    }

    for (const record of attendanceRecords as any[]) {
      const monthKey = monthKeyFromDate(new Date(record.date));
      const monthEntry = monthlyStudentMap.get(monthKey);
      if (!monthEntry) {
        continue;
      }
      const studentKey = String(record.student);
      const current = monthEntry.get(studentKey) || { present: 0, total: 0 };
      current.total += 1;
      if (record.status === "present") {
        current.present += 1;
      }
      monthEntry.set(studentKey, current);
    }

    const classPerformance = months.map((month) => {
      const studentBuckets = Array.from(
        monthlyStudentMap.get(month.key)?.values() || []
      );
      if (studentBuckets.length === 0) {
        return { month: month.label, average: 0, highest: 0, lowest: 0 };
      }

      const percentages = studentBuckets.map((entry) =>
        entry.total > 0 ? (entry.present / entry.total) * 100 : 0
      );
      const average =
        percentages.reduce((sum, value) => sum + value, 0) / percentages.length;
      const highest = Math.max(...percentages);
      const lowest = Math.min(...percentages);

      return {
        month: month.label,
        average: round(average),
        highest: round(highest),
        lowest: round(lowest),
      };
    });

    return res.status(200).json({
      stats: {
        totalStudents: matchedStudents.length,
        averageMarks: completionRate,
        attendance: avgAttendance,
        activeAssignments: pendingAssignmentSet.size,
      },
      charts: {
        classPerformance,
      },
    });
  } catch (error) {
    console.error("GET TEACHER OVERVIEW ERROR:", error);
    return res.status(500).json({
      message: "Server error while fetching teacher overview",
    });
  }
};

export const getAdminOverview = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const [
      totalStudents,
      totalTeachers,
      activeCourses,
      totalSubmissions,
      completedSubmissions,
      recentAnnouncements,
    ] = await Promise.all([
      Student.countDocuments(),
      Teacher.countDocuments(),
      Subject.countDocuments({ isActive: true }),
      AssignmentSubmission.countDocuments(),
      AssignmentSubmission.countDocuments({ status: "completed" }),
      Announcement.find()
        .select("title createdAt subject")
        .sort({ createdAt: -1 })
        .limit(3)
        .lean(),
    ]);

    const avgPerformance =
      totalSubmissions > 0 ? round((completedSubmissions / totalSubmissions) * 100) : 0;

    const months = buildLastMonths();
    const startDate = months[0].start;

    const [
      studentHistory,
      teacherHistory,
      subjectHistory,
      studentsBeforePeriod,
      teachersBeforePeriod,
      subjectsBeforePeriod,
    ] = await Promise.all([
      Student.find({ createdAt: { $gte: startDate } }).select("createdAt").lean(),
      Teacher.find({ createdAt: { $gte: startDate } }).select("createdAt").lean(),
      Subject.find({ createdAt: { $gte: startDate }, isActive: true })
        .select("createdAt")
        .lean(),
      Student.countDocuments({ createdAt: { $lt: startDate } }),
      Teacher.countDocuments({ createdAt: { $lt: startDate } }),
      Subject.countDocuments({ createdAt: { $lt: startDate }, isActive: true }),
    ]);

    const studentMonthAdds = new Map<string, number>();
    const teacherMonthAdds = new Map<string, number>();
    const subjectMonthAdds = new Map<string, number>();

    for (const month of months) {
      studentMonthAdds.set(month.key, 0);
      teacherMonthAdds.set(month.key, 0);
      subjectMonthAdds.set(month.key, 0);
    }

    for (const item of studentHistory as any[]) {
      const key = monthKeyFromDate(new Date(item.createdAt));
      if (studentMonthAdds.has(key)) {
        studentMonthAdds.set(key, (studentMonthAdds.get(key) || 0) + 1);
      }
    }

    for (const item of teacherHistory as any[]) {
      const key = monthKeyFromDate(new Date(item.createdAt));
      if (teacherMonthAdds.has(key)) {
        teacherMonthAdds.set(key, (teacherMonthAdds.get(key) || 0) + 1);
      }
    }

    for (const item of subjectHistory as any[]) {
      const key = monthKeyFromDate(new Date(item.createdAt));
      if (subjectMonthAdds.has(key)) {
        subjectMonthAdds.set(key, (subjectMonthAdds.get(key) || 0) + 1);
      }
    }

    let runningStudents = studentsBeforePeriod;
    let runningTeachers = teachersBeforePeriod;
    let runningCourses = subjectsBeforePeriod;

    const systemGrowth = months.map((month) => {
      runningStudents += studentMonthAdds.get(month.key) || 0;
      runningTeachers += teacherMonthAdds.get(month.key) || 0;
      runningCourses += subjectMonthAdds.get(month.key) || 0;
      return {
        month: month.label,
        students: runningStudents,
        teachers: runningTeachers,
        courses: runningCourses,
      };
    });

    return res.status(200).json({
      stats: {
        totalStudents,
        totalTeachers,
        activeCourses,
        avgPerformance,
      },
      charts: {
        systemGrowth,
      },
      recentAnnouncements: recentAnnouncements.map((item: any) => ({
        title: item.title,
        date: new Date(item.createdAt).toLocaleDateString("en-IN"),
        subject: item.subject,
      })),
    });
  } catch (error) {
    console.error("GET ADMIN OVERVIEW ERROR:", error);
    return res.status(500).json({
      message: "Server error while fetching admin overview",
    });
  }
};
