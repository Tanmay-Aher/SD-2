import { Schema, model, Types } from "mongoose";

const subjectSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    teacher: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    students: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

export const Subject = model("Subject", subjectSchema);