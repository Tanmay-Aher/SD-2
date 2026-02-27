import { Request, Response } from "express";
import { Student } from "../models/Student.model";

export const getStudentsByClass = async (req: Request, res: Response) => {
  try {
    const { className } = req.params;

    const students = await Student.find({ class: className })
      .select("_id rollNumber firstName lastName")
      .sort({ rollNumber: 1 });

    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch students", error });
  }
};