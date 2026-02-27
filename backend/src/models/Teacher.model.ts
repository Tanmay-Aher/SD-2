import { Schema, model, Document, Types } from "mongoose";

export interface ITeacher extends Document {
  user: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  subjects: Types.ObjectId[];
}

const teacherSchema = new Schema<ITeacher>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    department: {
      type: String,
      required: true,
    },
    subjects: [
      {
        type: Schema.Types.ObjectId,
        ref: "Subject",
      },
    ],
  },
  { timestamps: true }
);

export const Teacher = model<ITeacher>("Teacher", teacherSchema);