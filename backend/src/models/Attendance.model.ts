import mongoose, { Document, Schema } from "mongoose";

export interface IAttendance extends Document {
  student: mongoose.Types.ObjectId;
  teacher: mongoose.Types.ObjectId;
  subject: string;
  date: Date;
  status: "present" | "absent";
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
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

attendanceSchema.index(
  { student: 1, subject: 1, date: 1 },
  { unique: true, name: "attendance_student_subject_date_unique" }
);

export const Attendance = mongoose.model<IAttendance>(
  "Attendance",
  attendanceSchema
);
