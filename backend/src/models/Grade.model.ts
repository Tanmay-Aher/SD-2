import { Schema, model, Types } from "mongoose";

const gradeSchema = new Schema(
  {
    student: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    marks: {
      type: Number,
      required: true,
    },
    examType: {
      type: String,
      enum: ["internal", "external"],
      required: true,
    },
  },
  { timestamps: true }
);

export const Grade = model("Grade", gradeSchema);