import { Request, Response } from "express";
import { Subject } from "../models/Subject.model";

export const createSubject = async (req: Request, res: Response) => {
  const { name, code, teacherId } = req.body;

  const subject = await Subject.create({
    name,
    code,
    teacher: teacherId,
  });

  res.status(201).json(subject);
};

export const assignStudents = async (req: Request, res: Response) => {
  const { subjectId, studentIds } = req.body;

  const subject = await Subject.findByIdAndUpdate(
    subjectId,
    { $addToSet: { students: { $each: studentIds } } },
    { new: true }
  );

  res.json(subject);
};