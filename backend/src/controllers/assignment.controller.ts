import { Response } from "express";
import { Types } from "mongoose";
import { Assignment, AssignmentSubmission } from "../models/Assignment.model";
import { Teacher } from "../models/Teacher.model";
import { Student } from "../models/Student.model";
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

const getTeacherContext = async (userId: string) => {
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
    department: teacher.department,
    subject: assignedSubject.name,
  };
};

export const createAssignment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { title, description, dueDate } = req.body as {
      title?: string;
      description?: string;
      dueDate?: string;
    };

    if (!title?.trim() || !description?.trim() || !dueDate) {
      return res.status(400).json({
        message: "Title, description, and due date are required",
      });
    }

    const parsedDueDate = new Date(dueDate);
    if (Number.isNaN(parsedDueDate.getTime())) {
      return res.status(400).json({ message: "Invalid due date" });
    }

    const teacherContext = await getTeacherContext(req.user.id);
    if ("error" in teacherContext) {
      return res.status(400).json({ message: teacherContext.error });
    }

    const assignment = await Assignment.create({
      title: title.trim(),
      description: description.trim(),
      subject: teacherContext.subject,
      teacher: req.user.id,
      dueDate: parsedDueDate,
      department: teacherContext.department,
    });

    const students = await Student.find()
      .select("_id class")
      .lean();
    const matchedStudents = students.filter((student) =>
      departmentMatches(student.class, teacherContext.department)
    );

    if (matchedStudents.length > 0) {
      const submissionDocs = matchedStudents.map((student) => ({
        assignment: assignment._id,
        student: student._id,
      }));

      await AssignmentSubmission.insertMany(submissionDocs, { ordered: false });
    }

    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate("teacher", "firstName lastName")
      .lean();

    return res.status(201).json({
      message: "Assignment created successfully",
      assignment: populatedAssignment,
      submissionsCreated: matchedStudents.length,
    });
  } catch (error) {
    console.error("CREATE ASSIGNMENT ERROR:", error);
    return res
      .status(500)
      .json({ message: "Server error while creating assignment" });
  }
};

export const markAssignmentCompleted = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { submissionId } = req.params;
    if (!Types.ObjectId.isValid(submissionId)) {
      return res.status(400).json({ message: "Invalid submission id" });
    }

    const submission = await AssignmentSubmission.findById(submissionId).populate(
      "assignment",
      "teacher"
    );

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    const assignmentDoc = submission.assignment as any;
    if (!assignmentDoc?.teacher || assignmentDoc.teacher.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can only mark submissions for your assignments",
      });
    }

    submission.status = "completed";
    submission.completedAt = new Date();
    await submission.save();

    const updatedSubmission = await AssignmentSubmission.findById(submissionId)
      .populate({
        path: "assignment",
        populate: {
          path: "teacher",
          select: "firstName lastName",
        },
      })
      .populate({
        path: "student",
        select: "firstName lastName rollNumber class user",
        populate: { path: "user", select: "email" },
      })
      .lean();

    return res.status(200).json({
      message: "Submission marked as completed",
      submission: updatedSubmission,
    });
  } catch (error) {
    console.error("MARK ASSIGNMENT COMPLETED ERROR:", error);
    return res
      .status(500)
      .json({ message: "Server error while updating submission status" });
  }
};

export const getMyAssignments = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const student = await Student.findOne({ user: req.user.id })
      .select("_id class")
      .lean();
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    const existingSubmissions = await AssignmentSubmission.find({
      student: student._id,
    })
      .select("assignment")
      .lean();

    const existingAssignmentIds = new Set(
      existingSubmissions.map((submission: any) => String(submission.assignment))
    );

    const assignmentsByDepartment = await Assignment.find()
      .select("_id department")
      .lean();

    const missingSubmissions = assignmentsByDepartment
      .filter((assignment) =>
        departmentMatches(assignment.department, student.class)
      )
      .filter((assignment) => !existingAssignmentIds.has(String(assignment._id)))
      .map((assignment) => ({
        assignment: assignment._id,
        student: student._id,
      }));

    if (missingSubmissions.length > 0) {
      try {
        await AssignmentSubmission.insertMany(missingSubmissions, {
          ordered: false,
        });
      } catch {
        // Ignore duplicate key races and proceed with fetch.
      }
    }

    const submissions = await AssignmentSubmission.find({ student: student._id })
      .populate({
        path: "assignment",
        select: "title description subject dueDate department teacher createdAt",
        populate: {
          path: "teacher",
          select: "firstName lastName",
        },
      })
      .sort({ createdAt: -1 })
      .lean();

    const assignments = submissions
      .filter((item: any) => item.assignment)
      .map((item: any) => ({
        submissionId: String(item._id),
        assignmentId: String(item.assignment._id),
        title: item.assignment.title,
        description: item.assignment.description,
        subject: item.assignment.subject,
        dueDate: item.assignment.dueDate,
        department: item.assignment.department,
        teacher: item.assignment.teacher,
        status: item.status,
        completedAt: item.completedAt || null,
        assignedAt: item.assignment.createdAt,
      }));

    return res.status(200).json({ assignments });
  } catch (error) {
    console.error("GET MY ASSIGNMENTS ERROR:", error);
    return res
      .status(500)
      .json({ message: "Server error while fetching assignments" });
  }
};

export const getTeacherAssignments = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const teacherAssignments = await Assignment.find({ teacher: req.user.id })
      .populate("teacher", "firstName lastName")
      .sort({ createdAt: -1 })
      .lean();

    if (teacherAssignments.length === 0) {
      return res.status(200).json({ assignments: [] });
    }

    const assignmentIds = teacherAssignments.map((assignment) => assignment._id);

    const submissions = await AssignmentSubmission.find({
      assignment: { $in: assignmentIds },
    })
      .populate({
        path: "student",
        select: "firstName lastName rollNumber class user",
        populate: { path: "user", select: "email" },
      })
      .sort({ createdAt: 1 })
      .lean();

    const grouped = new Map<string, any[]>();
    for (const submission of submissions) {
      const key = String(submission.assignment);
      const existing = grouped.get(key) || [];
      existing.push(submission);
      grouped.set(key, existing);
    }

    const assignments = teacherAssignments.map((assignment: any) => ({
      ...assignment,
      submissions: (grouped.get(String(assignment._id)) || []).map((submission: any) => ({
        _id: submission._id,
        status: submission.status,
        completedAt: submission.completedAt || null,
        student: submission.student,
      })),
    }));

    return res.status(200).json({ assignments });
  } catch (error) {
    console.error("GET TEACHER ASSIGNMENTS ERROR:", error);
    return res
      .status(500)
      .json({ message: "Server error while fetching teacher assignments" });
  }
};
