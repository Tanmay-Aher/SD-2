import { Schema, model, Types } from "mongoose";

const attendanceSchema = new Schema(
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
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["present", "absent"],
      required: true,
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ student: 1, subject: 1, date: 1 }, { unique: true });

export const Attendance = model("Attendance", attendanceSchema);