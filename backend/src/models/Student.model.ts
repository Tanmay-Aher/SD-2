import mongoose, { Schema, Types } from "mongoose";

export interface IStudent extends mongoose.Document {
  user: Types.ObjectId;       // 🔗 LINK TO USER
  firstName: string;
  lastName: string;
  rollNumber: number;
  class: string;
}

const studentSchema = new Schema<IStudent>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,           // one user = one student
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    rollNumber: { type: Number, required: true, unique: true },
    class: { type: String, required: true },
  },
  { timestamps: true }
);

export const Student = mongoose.model<IStudent>("Student", studentSchema);