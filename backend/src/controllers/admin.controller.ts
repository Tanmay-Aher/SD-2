import { Request, Response } from "express";
import { Types } from "mongoose";
import { Announcement } from "../models/Announcement.model";
import { Assignment, AssignmentSubmission } from "../models/Assignment.model";
import { Attendance } from "../models/Attendance.model";
import { Student } from "../models/Student.model";
import { Subject } from "../models/Subject.model";
import { Teacher } from "../models/Teacher.model";
import { User } from "../models/User.model";

const isObjectId = (value: string) => Types.ObjectId.isValid(value);
const toPositiveInt = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.floor(parsed);
};

const round = (value: number) => Math.round(value * 100) / 100;

const buildPagination = (query: Request["query"]) => {
  const page = toPositiveInt(query.page as string | undefined, 1);
  const limit = Math.min(toPositiveInt(query.limit as string | undefined, 10), 100);
  return { page, limit, skip: (page - 1) * limit };
};

const splitName = (firstName: string, lastName: string) =>
  `${firstName || ""} ${lastName || ""}`.trim();

const normalizeCode = (name: string, department: string) => {
  const base = `${department}-${name}`
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 18);
  return `${base}-${Date.now().toString().slice(-4)}`;
};

const removeTeacherData = async (userId: Types.ObjectId | string) => {
  const teacher = await Teacher.findOne({ user: userId }).select("_id");
  if (!teacher) return;

  await Subject.updateMany(
    { teachers: teacher._id },
    { $pull: { teachers: teacher._id } }
  );
  await Teacher.findByIdAndDelete(teacher._id);
};

const removeStudentData = async (userId: Types.ObjectId | string) => {
  const student = await Student.findOne({ user: userId }).select("_id");
  if (!student) return;

  await Promise.all([
    Attendance.deleteMany({ student: student._id }),
    AssignmentSubmission.deleteMany({ student: student._id }),
    Student.findByIdAndDelete(student._id),
  ]);
};

export const getAdminOverview = async (_req: Request, res: Response) => {
  try {
    const [
      totalStudents,
      totalTeachers,
      totalAssignments,
      totalAnnouncements,
      totalAttendance,
      presentAttendance,
    ] = await Promise.all([
      Student.countDocuments(),
      Teacher.countDocuments(),
      Assignment.countDocuments(),
      Announcement.countDocuments(),
      Attendance.countDocuments(),
      Attendance.countDocuments({ status: "present" }),
    ]);

    const attendanceAverage =
      totalAttendance > 0 ? round((presentAttendance / totalAttendance) * 100) : 0;

    return res.status(200).json({
      stats: {
        totalStudents,
        totalTeachers,
        totalAssignments,
        totalAnnouncements,
        attendanceAverage,
      },
    });
  } catch (error) {
    console.error("ADMIN OVERVIEW ERROR:", error);
    return res.status(500).json({ message: "Server error while loading overview" });
  }
};

export const getAdminUsers = async (req: Request, res: Response) => {
  try {
    const { role, search } = req.query as { role?: string; search?: string };
    const { page, limit, skip } = buildPagination(req.query);

    const filter: Record<string, unknown> = {};
    if (role && ["admin", "teacher", "student"].includes(role)) {
      filter.role = role;
    }

    if (search?.trim()) {
      filter.$or = [
        { firstName: { $regex: search.trim(), $options: "i" } },
        { lastName: { $regex: search.trim(), $options: "i" } },
        { email: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("firstName lastName email role createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    const userIds = users.map((user: any) => user._id);
    const [teachers, students] = await Promise.all([
      Teacher.find({ user: { $in: userIds } }).select("user department").lean(),
      Student.find({ user: { $in: userIds } }).select("user class rollNumber").lean(),
    ]);

    const teacherMap = new Map(teachers.map((teacher: any) => [String(teacher.user), teacher]));
    const studentMap = new Map(students.map((student: any) => [String(student.user), student]));

    return res.status(200).json({
      users: users.map((user: any) => {
        const teacher = teacherMap.get(String(user._id));
        const student = studentMap.get(String(user._id));
        return {
          id: String(user._id),
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: splitName(user.firstName, user.lastName),
          email: user.email,
          role: user.role,
          department: teacher?.department || null,
          class: student?.class || null,
          rollNumber: student?.rollNumber || null,
          createdAt: user.createdAt,
        };
      }),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
    });
  } catch (error) {
    console.error("GET ADMIN USERS ERROR:", error);
    return res.status(500).json({ message: "Server error while fetching users" });
  }
};

export const createAdminUser = async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      department,
      class: className,
      rollNumber,
    } = req.body as {
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
      role?: "admin" | "teacher" | "student";
      department?: string;
      class?: string;
      rollNumber?: number;
    };

    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({ message: "Missing required user fields" });
    }

    if (!["admin", "teacher", "student"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (role === "teacher" && !department) {
      return res.status(400).json({ message: "Department is required for teachers" });
    }

    if (role === "student" && (!className || !rollNumber)) {
      return res.status(400).json({
        message: "Class and rollNumber are required for students",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const exists = await User.findOne({ email: normalizedEmail }).select("_id").lean();
    if (exists) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      password,
      role,
    });

    try {
      if (role === "teacher") {
        await Teacher.create({
          user: user._id,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: normalizedEmail,
          department: department?.trim(),
          subjects: [],
        });
      }

      if (role === "student") {
        await Student.create({
          user: user._id,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          class: className?.trim(),
          rollNumber: Number(rollNumber),
        });
      }
    } catch (profileError) {
      await User.findByIdAndDelete(user._id);
      throw profileError;
    }

    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: String(user._id),
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: splitName(user.firstName, user.lastName),
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Duplicate unique value" });
    }
    console.error("CREATE ADMIN USER ERROR:", error);
    return res.status(500).json({ message: "Server error while creating user" });
  }
};

export const updateAdminUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const {
      firstName,
      lastName,
      email,
      role,
      department,
      class: className,
      rollNumber,
    } = req.body as {
      firstName?: string;
      lastName?: string;
      email?: string;
      role?: "admin" | "teacher" | "student";
      department?: string;
      class?: string;
      rollNumber?: number;
    };

    if (email) {
      const normalizedEmail = email.trim().toLowerCase();
      const existing = await User.findOne({ email: normalizedEmail }).select("_id").lean();
      if (existing && String(existing._id) !== String(user._id)) {
        return res.status(409).json({ message: "Email already in use" });
      }
      user.email = normalizedEmail;
    }

    if (firstName) user.firstName = firstName.trim();
    if (lastName) user.lastName = lastName.trim();

    const previousRole = user.role;
    const nextRole = role || user.role;
    if (!["admin", "teacher", "student"].includes(nextRole)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    user.role = nextRole;
    await user.save();

    if (previousRole === "teacher" && nextRole !== "teacher") await removeTeacherData(user._id);
    if (previousRole === "student" && nextRole !== "student") await removeStudentData(user._id);

    if (nextRole === "teacher") {
      let teacher = await Teacher.findOne({ user: user._id });
      if (!teacher) {
        if (!department?.trim()) {
          return res.status(400).json({
            message: "Department is required when assigning teacher role",
          });
        }
        teacher = await Teacher.create({
          user: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          department: department.trim(),
          subjects: [],
        });
      } else {
        teacher.firstName = user.firstName;
        teacher.lastName = user.lastName;
        teacher.email = user.email;
        if (department?.trim()) teacher.department = department.trim();
        await teacher.save();
      }
    }

    if (nextRole === "student") {
      let student = await Student.findOne({ user: user._id });
      if (!student) {
        if (!className?.trim() || !rollNumber) {
          return res.status(400).json({
            message: "Class and rollNumber are required when assigning student role",
          });
        }
        student = await Student.create({
          user: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          class: className.trim(),
          rollNumber: Number(rollNumber),
        });
      } else {
        student.firstName = user.firstName;
        student.lastName = user.lastName;
        if (className?.trim()) student.class = className.trim();
        if (rollNumber) student.rollNumber = Number(rollNumber);
        await student.save();
      }
    }

    return res.status(200).json({
      message: "User updated successfully",
      user: {
        id: String(user._id),
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: splitName(user.firstName, user.lastName),
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Duplicate unique value" });
    }
    console.error("UPDATE ADMIN USER ERROR:", error);
    return res.status(500).json({ message: "Server error while updating user" });
  }
};

export const deleteAdminUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const user = await User.findById(id).select("_id").lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await removeTeacherData(user._id);
    await removeStudentData(user._id);
    await User.findByIdAndDelete(user._id);

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("DELETE ADMIN USER ERROR:", error);
    return res.status(500).json({ message: "Server error while deleting user" });
  }
};

export const resetUserPassword = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body as { newPassword?: string };

    if (!isObjectId(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    if (!newPassword || newPassword.trim().length < 6) {
      return res.status(400).json({
        message: "newPassword is required and must be at least 6 characters",
      });
    }

    const user = await User.findById(id).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = newPassword.trim();
    await user.save();

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("RESET USER PASSWORD ERROR:", error);
    return res.status(500).json({ message: "Server error while resetting password" });
  }
};

export const createSubjectAdmin = async (req: Request, res: Response) => {
  try {
    const { name, department, semester, code, teacherUserId } = req.body as {
      name?: string;
      department?: string;
      semester?: number;
      code?: string;
      teacherUserId?: string;
    };

    if (!name?.trim() || !department?.trim()) {
      return res.status(400).json({ message: "name and department are required" });
    }

    let teacherId: Types.ObjectId | null = null;
    if (teacherUserId) {
      if (!isObjectId(teacherUserId)) {
        return res.status(400).json({ message: "Invalid teacherUserId" });
      }
      const teacher = await Teacher.findOne({ user: teacherUserId }).select("_id").lean();
      if (!teacher) {
        return res.status(404).json({ message: "Teacher profile not found" });
      }
      teacherId = teacher._id as Types.ObjectId;
    }

    const subjectCode = (code || normalizeCode(name.trim(), department.trim()))
      .toUpperCase()
      .trim();

    const exists = await Subject.findOne({ code: subjectCode }).select("_id").lean();
    if (exists) {
      return res.status(409).json({ message: "Subject code already exists" });
    }

    const subject = await Subject.create({
      name: name.trim(),
      department: department.trim(),
      semester: semester || 1,
      code: subjectCode,
      teachers: teacherId ? [teacherId] : [],
    });

    if (teacherId) {
      await Teacher.findByIdAndUpdate(teacherId, { $addToSet: { subjects: subject._id } });
    }

    const populated = await Subject.findById(subject._id)
      .populate({
        path: "teachers",
        select: "firstName lastName email department user",
        populate: { path: "user", select: "email role" },
      })
      .lean();

    return res.status(201).json({
      message: "Subject created successfully",
      subject: populated,
    });
  } catch (error: any) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Subject code already exists" });
    }
    console.error("CREATE SUBJECT ADMIN ERROR:", error);
    return res.status(500).json({ message: "Server error while creating subject" });
  }
};

export const assignTeacherToSubject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { teacherUserId } = req.body as { teacherUserId?: string };

    if (!isObjectId(id)) {
      return res.status(400).json({ message: "Invalid subject id" });
    }
    if (!teacherUserId || !isObjectId(teacherUserId)) {
      return res.status(400).json({ message: "Valid teacherUserId is required" });
    }

    const [subject, teacher] = await Promise.all([
      Subject.findById(id),
      Teacher.findOne({ user: teacherUserId }),
    ]);

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }
    if (!teacher) {
      return res.status(404).json({ message: "Teacher profile not found" });
    }

    subject.teachers = [teacher._id];
    await subject.save();
    await Teacher.findByIdAndUpdate(teacher._id, { $addToSet: { subjects: subject._id } });

    return res.status(200).json({ message: "Teacher assigned successfully" });
  } catch (error) {
    console.error("ASSIGN TEACHER SUBJECT ERROR:", error);
    return res.status(500).json({ message: "Server error while assigning teacher" });
  }
};

export const getSubjectsAdmin = async (req: Request, res: Response) => {
  try {
    const { search, department } = req.query as { search?: string; department?: string };
    const { page, limit, skip } = buildPagination(req.query);

    const filter: Record<string, unknown> = {};
    if (search?.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { code: { $regex: search.trim(), $options: "i" } },
      ];
    }
    if (department?.trim()) {
      filter.department = { $regex: `^${department.trim()}$`, $options: "i" };
    }

    const [subjects, total] = await Promise.all([
      Subject.find(filter)
        .populate({
          path: "teachers",
          select: "firstName lastName email department user",
          populate: { path: "user", select: "email role" },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Subject.countDocuments(filter),
    ]);

    return res.status(200).json({
      subjects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
    });
  } catch (error) {
    console.error("GET SUBJECTS ADMIN ERROR:", error);
    return res.status(500).json({ message: "Server error while fetching subjects" });
  }
};

export const deleteSubjectAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) {
      return res.status(400).json({ message: "Invalid subject id" });
    }

    const subject = await Subject.findById(id).select("_id teachers").lean();
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    if (subject.teachers?.length) {
      await Teacher.updateMany(
        { _id: { $in: subject.teachers } },
        { $pull: { subjects: subject._id } }
      );
    }

    await Subject.findByIdAndDelete(subject._id);
    return res.status(200).json({ message: "Subject deleted successfully" });
  } catch (error) {
    console.error("DELETE SUBJECT ADMIN ERROR:", error);
    return res.status(500).json({ message: "Server error while deleting subject" });
  }
};

export const getStudentsAdmin = async (req: Request, res: Response) => {
  try {
    const { department, search } = req.query as { department?: string; search?: string };
    const { page, limit, skip } = buildPagination(req.query);

    const filter: Record<string, unknown> = {};
    if (department?.trim()) {
      filter.class = { $regex: department.trim(), $options: "i" };
    }
    if (search?.trim()) {
      filter.$or = [
        { firstName: { $regex: search.trim(), $options: "i" } },
        { lastName: { $regex: search.trim(), $options: "i" } },
        { class: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const [students, total] = await Promise.all([
      Student.find(filter)
        .populate("user", "email role")
        .sort({ rollNumber: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Student.countDocuments(filter),
    ]);

    return res.status(200).json({
      students: students.map((student: any) => ({
        id: String(student._id),
        userId: String(student.user?._id || ""),
        firstName: student.firstName,
        lastName: student.lastName,
        fullName: splitName(student.firstName, student.lastName),
        email: student.user?.email || "",
        class: student.class,
        rollNumber: student.rollNumber,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
    });
  } catch (error) {
    console.error("GET STUDENTS ADMIN ERROR:", error);
    return res.status(500).json({ message: "Server error while fetching students" });
  }
};

export const updateStudentAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) {
      return res.status(400).json({ message: "Invalid student id" });
    }

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const { firstName, lastName, class: className, rollNumber, email } = req.body as {
      firstName?: string;
      lastName?: string;
      class?: string;
      rollNumber?: number;
      email?: string;
    };

    if (firstName) student.firstName = firstName.trim();
    if (lastName) student.lastName = lastName.trim();
    if (className) student.class = className.trim();
    if (rollNumber) student.rollNumber = Number(rollNumber);

    await student.save();

    const user = await User.findById(student.user);
    if (user) {
      user.firstName = student.firstName;
      user.lastName = student.lastName;
      if (email?.trim()) {
        const normalizedEmail = email.trim().toLowerCase();
        const exists = await User.findOne({ email: normalizedEmail }).select("_id").lean();
        if (exists && String(exists._id) !== String(user._id)) {
          return res.status(409).json({ message: "Email already in use" });
        }
        user.email = normalizedEmail;
      }
      await user.save();
    }

    return res.status(200).json({ message: "Student updated successfully" });
  } catch (error: any) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Duplicate unique value" });
    }
    console.error("UPDATE STUDENT ADMIN ERROR:", error);
    return res.status(500).json({ message: "Server error while updating student" });
  }
};

export const deleteStudentAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) {
      return res.status(400).json({ message: "Invalid student id" });
    }

    const student = await Student.findById(id).select("_id user").lean();
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    await Promise.all([
      Attendance.deleteMany({ student: student._id }),
      AssignmentSubmission.deleteMany({ student: student._id }),
      Student.findByIdAndDelete(student._id),
      User.findByIdAndDelete(student.user),
    ]);

    return res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("DELETE STUDENT ADMIN ERROR:", error);
    return res.status(500).json({ message: "Server error while deleting student" });
  }
};

export const getAssignmentsAdmin = async (req: Request, res: Response) => {
  try {
    const { search } = req.query as { search?: string };
    const { page, limit, skip } = buildPagination(req.query);

    const filter: Record<string, unknown> = {};
    if (search?.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { subject: { $regex: search.trim(), $options: "i" } },
        { department: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const [assignments, total] = await Promise.all([
      Assignment.find(filter)
        .populate("teacher", "firstName lastName email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Assignment.countDocuments(filter),
    ]);

    const assignmentIds = assignments.map((assignment: any) => assignment._id);
    const submissionStats =
      assignmentIds.length > 0
        ? await AssignmentSubmission.aggregate([
            { $match: { assignment: { $in: assignmentIds } } },
            {
              $group: {
                _id: "$assignment",
                total: { $sum: 1 },
                completed: {
                  $sum: {
                    $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
                  },
                },
              },
            },
          ])
        : [];

    const statsMap = new Map(
      submissionStats.map((entry: any) => [String(entry._id), entry])
    );

    return res.status(200).json({
      assignments: assignments.map((assignment: any) => {
        const stats = statsMap.get(String(assignment._id));
        const totalSubmissions = Number(stats?.total || 0);
        const completedSubmissions = Number(stats?.completed || 0);
        return {
          ...assignment,
          stats: {
            totalSubmissions,
            completedSubmissions,
            completionPercentage:
              totalSubmissions > 0
                ? round((completedSubmissions / totalSubmissions) * 100)
                : 0,
          },
        };
      }),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
    });
  } catch (error) {
    console.error("GET ASSIGNMENTS ADMIN ERROR:", error);
    return res.status(500).json({ message: "Server error while fetching assignments" });
  }
};

export const deleteAssignmentAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) {
      return res.status(400).json({ message: "Invalid assignment id" });
    }

    const assignment = await Assignment.findById(id).select("_id").lean();
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    await Promise.all([
      AssignmentSubmission.deleteMany({ assignment: assignment._id }),
      Assignment.findByIdAndDelete(assignment._id),
    ]);

    return res.status(200).json({ message: "Assignment deleted successfully" });
  } catch (error) {
    console.error("DELETE ASSIGNMENT ADMIN ERROR:", error);
    return res.status(500).json({ message: "Server error while deleting assignment" });
  }
};

export const getAnnouncementsAdmin = async (req: Request, res: Response) => {
  try {
    const { search } = req.query as { search?: string };
    const { page, limit, skip } = buildPagination(req.query);

    const filter: Record<string, unknown> = {};
    if (search?.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { message: { $regex: search.trim(), $options: "i" } },
        { subject: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const [announcements, total] = await Promise.all([
      Announcement.find(filter)
        .populate("teacher", "firstName lastName email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Announcement.countDocuments(filter),
    ]);

    return res.status(200).json({
      announcements,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
    });
  } catch (error) {
    console.error("GET ANNOUNCEMENTS ADMIN ERROR:", error);
    return res.status(500).json({ message: "Server error while fetching announcements" });
  }
};

export const updateAnnouncementAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, message, targetDepartment } = req.body as {
      title?: string;
      message?: string;
      targetDepartment?: string;
    };

    if (!isObjectId(id)) {
      return res.status(400).json({ message: "Invalid announcement id" });
    }

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    if (title?.trim()) announcement.title = title.trim();
    if (message?.trim()) announcement.message = message.trim();
    if (targetDepartment !== undefined) announcement.targetDepartment = targetDepartment.trim();

    await announcement.save();
    return res.status(200).json({ message: "Announcement updated successfully" });
  } catch (error) {
    console.error("UPDATE ANNOUNCEMENT ADMIN ERROR:", error);
    return res.status(500).json({ message: "Server error while updating announcement" });
  }
};

export const deleteAnnouncementAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) {
      return res.status(400).json({ message: "Invalid announcement id" });
    }

    const announcement = await Announcement.findById(id).select("_id").lean();
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    await Announcement.findByIdAndDelete(announcement._id);
    return res.status(200).json({ message: "Announcement deleted successfully" });
  } catch (error) {
    console.error("DELETE ANNOUNCEMENT ADMIN ERROR:", error);
    return res.status(500).json({ message: "Server error while deleting announcement" });
  }
};

export const getAttendanceReportAdmin = async (_req: Request, res: Response) => {
  try {
    const students = await Student.find()
      .populate("user", "email")
      .select("firstName lastName rollNumber class")
      .lean();

    const studentIds = students.map((student: any) => student._id);
    const attendanceAgg =
      studentIds.length > 0
        ? await Attendance.aggregate([
            { $match: { student: { $in: studentIds } } },
            {
              $group: {
                _id: "$student",
                total: { $sum: 1 },
                present: {
                  $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] },
                },
              },
            },
          ])
        : [];

    const attendanceMap = new Map(
      attendanceAgg.map((entry: any) => [String(entry._id), entry])
    );

    const perStudent = students.map((student: any) => {
      const stats = attendanceMap.get(String(student._id));
      const total = Number(stats?.total || 0);
      const present = Number(stats?.present || 0);
      return {
        studentId: String(student._id),
        userId: String(student.user?._id || ""),
        fullName: splitName(student.firstName, student.lastName),
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.user?.email || "",
        class: student.class,
        rollNumber: student.rollNumber,
        totalClasses: total,
        presentClasses: present,
        attendancePercentage: total > 0 ? round((present / total) * 100) : 0,
      };
    });

    const classMap = new Map<string, { total: number; present: number; students: number }>();
    for (const item of perStudent) {
      const current = classMap.get(item.class) || { total: 0, present: 0, students: 0 };
      current.total += item.totalClasses;
      current.present += item.presentClasses;
      current.students += 1;
      classMap.set(item.class, current);
    }

    const perClass = Array.from(classMap.entries()).map(([className, stats]) => ({
      class: className,
      students: stats.students,
      totalClasses: stats.total,
      presentClasses: stats.present,
      attendancePercentage:
        stats.total > 0 ? round((stats.present / stats.total) * 100) : 0,
    }));

    const totalClasses = perStudent.reduce((sum, item) => sum + item.totalClasses, 0);
    const totalPresent = perStudent.reduce((sum, item) => sum + item.presentClasses, 0);

    return res.status(200).json({
      summary: {
        totalStudents: perStudent.length,
        totalClasses,
        presentClasses: totalPresent,
        attendancePercentage: totalClasses > 0 ? round((totalPresent / totalClasses) * 100) : 0,
      },
      perStudent,
      perClass: perClass.sort((a, b) => a.class.localeCompare(b.class)),
    });
  } catch (error) {
    console.error("ATTENDANCE REPORT ADMIN ERROR:", error);
    return res.status(500).json({ message: "Server error while fetching attendance report" });
  }
};
