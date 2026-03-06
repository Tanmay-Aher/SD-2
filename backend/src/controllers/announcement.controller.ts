import { Response } from "express";
import { Announcement } from "../models/Announcement.model";
import { Teacher } from "../models/Teacher.model";
import { Student } from "../models/Student.model";
import { Subject } from "../models/Subject.model";
import { AuthRequest } from "../types/auth";

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

const getTeacherProfileWithSubject = async (userId: string) => {
  const teacher = await Teacher.findOne({ user: userId })
    .populate<{ subjects: Array<{ _id: string; name: string }> }>(
      "subjects",
      "name"
    )
    .lean();

  if (!teacher) {
    return { error: "Teacher profile not found" };
  }

  const assignedSubject = teacher.subjects?.[0];
  if (!assignedSubject) {
    return { error: "No subject assigned to teacher" };
  }

  return {
    teacher,
    subjectName: assignedSubject.name,
  };
};

export const createAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { title, message, targetDepartment } = req.body as {
      title?: string;
      message?: string;
      targetDepartment?: string;
    };

    if (!title?.trim() || !message?.trim()) {
      return res.status(400).json({ message: "Title and message are required" });
    }

    const teacherData = await getTeacherProfileWithSubject(req.user.id);
    if ("error" in teacherData) {
      return res.status(400).json({ message: teacherData.error });
    }

    const announcement = await Announcement.create({
      title: title.trim(),
      message: message.trim(),
      subject: teacherData.subjectName,
      teacher: req.user.id,
      targetDepartment: targetDepartment?.trim() || teacherData.teacher.department,
    });

    const populated = await Announcement.findById(announcement._id)
      .populate("teacher", "firstName lastName")
      .lean();

    return res.status(201).json({
      message: "Announcement created successfully",
      announcement: populated,
    });
  } catch (error) {
    console.error("CREATE ANNOUNCEMENT ERROR:", error);
    return res
      .status(500)
      .json({ message: "Server error while creating announcement" });
  }
};

export const getMyAnnouncements = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const student = await Student.findOne({ user: req.user.id }).select("class").lean();
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    const announcements = await Announcement.find()
      .populate("teacher", "firstName lastName")
      .sort({ createdAt: -1 })
      .lean();

    const filteredAnnouncements = announcements.filter((announcement: any) => {
      const target = announcement.targetDepartment;
      if (!target) {
        return true;
      }
      return departmentMatches(target, student.class);
    });

    return res.status(200).json({ announcements: filteredAnnouncements });
  } catch (error) {
    console.error("GET MY ANNOUNCEMENTS ERROR:", error);
    return res
      .status(500)
      .json({ message: "Server error while fetching announcements" });
  }
};

export const getTeacherAnnouncements = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const teacherData = await getTeacherProfileWithSubject(req.user.id);
    if ("error" in teacherData) {
      return res.status(400).json({ message: teacherData.error });
    }

    const announcements = await Announcement.find({ teacher: req.user.id })
      .populate("teacher", "firstName lastName")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      subject: teacherData.subjectName,
      announcements,
    });
  } catch (error) {
    console.error("GET TEACHER ANNOUNCEMENTS ERROR:", error);
    return res
      .status(500)
      .json({ message: "Server error while fetching teacher announcements" });
  }
};

export const getTeacherAssignedSubject = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const teacher = await Teacher.findOne({ user: req.user.id }).lean();
    if (!teacher) {
      return res.status(404).json({ message: "Teacher profile not found" });
    }

    const subjectId = teacher.subjects?.[0];
    if (!subjectId) {
      return res.status(404).json({ message: "No subject assigned to teacher" });
    }

    const subject = await Subject.findById(subjectId).select("name").lean();
    if (!subject) {
      return res.status(404).json({ message: "Assigned subject not found" });
    }

    return res.status(200).json({
      subject: subject.name,
      department: teacher.department,
    });
  } catch (error) {
    console.error("GET TEACHER SUBJECT ERROR:", error);
    return res
      .status(500)
      .json({ message: "Server error while fetching teacher subject" });
  }
};
