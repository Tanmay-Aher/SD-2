import mongoose, { Schema, Types } from "mongoose";

export interface IAssignment extends mongoose.Document {
  title: string;
  description: string;
  subject: string;
  teacher: Types.ObjectId;
  dueDate: Date;
  department: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAssignmentSubmission extends mongoose.Document {
  assignment: Types.ObjectId;
  student: Types.ObjectId;
  status: "pending" | "completed";
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const assignmentSchema = new Schema<IAssignment>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const assignmentSubmissionSchema = new Schema<IAssignmentSubmission>(
  {
    assignment: {
      type: Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

assignmentSubmissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

export const Assignment = mongoose.model<IAssignment>(
  "Assignment",
  assignmentSchema
);

export const AssignmentSubmission = mongoose.model<IAssignmentSubmission>(
  "AssignmentSubmission",
  assignmentSubmissionSchema
);
