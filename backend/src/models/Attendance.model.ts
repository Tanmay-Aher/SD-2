import mongoose, { Document, Schema, Types } from "mongoose";

export interface IAttendanceRecord {
  student: Types.ObjectId;
  status: "present" | "absent";
}

export interface IAttendance extends Document {
  date: Date;
  classId: string;
  subjectId: Types.ObjectId;
  subjectName: string;
  teacher: Types.ObjectId;
  records: IAttendanceRecord[];
  createdAt: Date;
  updatedAt: Date;
}

const attendanceRecordSchema = new Schema<IAttendanceRecord>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    status: {
      type: String,
      enum: ["present", "absent"],
      required: true,
    },
  },
  { _id: false }
);

const attendanceSchema = new Schema<IAttendance>(
  {
    date: {
      type: Date,
      required: true,
    },
    classId: {
      type: String,
      required: true,
      trim: true,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    subjectName: {
      type: String,
      required: true,
      trim: true,
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    records: {
      type: [attendanceRecordSchema],
      default: [],
    },
  },
  { timestamps: true }
);

attendanceSchema.index(
  { date: 1, classId: 1, subjectId: 1, teacher: 1 },
  { unique: true, name: "attendance_date_class_subject_teacher_unique" }
);

attendanceSchema.index(
  { "records.student": 1 },
  { name: "attendance_records_student_idx" }
);

export const Attendance = mongoose.model<IAttendance>("Attendance", attendanceSchema);
