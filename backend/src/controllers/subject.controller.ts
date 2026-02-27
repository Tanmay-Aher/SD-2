import { Request, Response } from "express";
import { Subject } from "../models/Subject.model";

/* =========================
   CREATE SUBJECT
========================= */
export const createSubject = async (req: Request, res: Response) => {
  try {
    const { code, name, department, semester } = req.body;

    // 1️⃣ Validate
    if (!code || !name || !department || !semester) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // 2️⃣ Check duplicate
    const existingSubject = await Subject.findOne({
      code: code.toUpperCase(),
    });

    if (existingSubject) {
      return res.status(400).json({
        message: "Subject already exists",
      });
    }

    // 3️⃣ Create
    const subject = await Subject.create({
      code,
      name,
      department,
      semester,
    });

    return res.status(201).json({
      message: "Subject created successfully",
      subject,
    });
  } catch (error) {
    console.error("CREATE SUBJECT ERROR:", error);
    return res.status(500).json({
      message: "Server error while creating subject",
    });
  }
};

/* =========================
   GET ALL SUBJECTS
========================= */
export const getAllSubjects = async (_req: Request, res: Response) => {
  try {
    const subjects = await Subject.find({ isActive: true }).sort({
      semester: 1,
    });

    return res.status(200).json({
      count: subjects.length,
      subjects,
    });
  } catch (error) {
    console.error("GET SUBJECTS ERROR:", error);
    return res.status(500).json({
      message: "Server error while fetching subjects",
    });
  }
};