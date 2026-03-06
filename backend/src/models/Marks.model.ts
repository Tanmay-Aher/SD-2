import mongoose, { Document, Schema } from "mongoose";

export interface IMarks extends Document {
  student: mongoose.Types.ObjectId;
  teacher: mongoose.Types.ObjectId;
  subject: string;
  class: string;
  ct1: number;
  ct2: number;
  createdAt: Date;
  updatedAt: Date;
}

const marksSchema = new Schema<IMarks>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    class: {
      type: String,
      required: true,
      trim: true,
    },
    ct1: {
      type: Number,
      required: true,
      min: 0,
      max: 30,
    },
    ct2: {
      type: Number,
      required: true,
      min: 0,
      max: 30,
    },
  },
  { timestamps: true }
);

marksSchema.index(
  { student: 1, subject: 1 },
  { unique: true, name: "marks_student_subject_unique" }
);

export const Marks = mongoose.model<IMarks>("Marks", marksSchema);
