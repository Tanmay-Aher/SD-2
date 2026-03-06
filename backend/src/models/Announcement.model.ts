import mongoose, { Schema, Types } from "mongoose";

export interface IAnnouncement extends mongoose.Document {
  title: string;
  message: string;
  subject: string;
  teacher: Types.ObjectId;
  targetDepartment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
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
    targetDepartment: {
      type: String,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Announcement = mongoose.model<IAnnouncement>(
  "Announcement",
  announcementSchema
);
