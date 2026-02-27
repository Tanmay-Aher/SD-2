import { Schema, model, Document, Types } from "mongoose";

/* =========================
   SUBJECT INTERFACE
========================= */
export interface ISubject extends Document {
  code: string;
  name: string;
  department: string;
  semester: number;
  isActive: boolean;
  teachers: Types.ObjectId[]; // 🔗 linked teachers
}

/* =========================
   SUBJECT SCHEMA
========================= */
const subjectSchema = new Schema<ISubject>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    teachers: [
      {
        type: Schema.Types.ObjectId,
        ref: "Teacher",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Subject = model<ISubject>("Subject", subjectSchema);