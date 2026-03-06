import mongoose from "mongoose";
import dotenv from "dotenv";
import { Attendance } from "../models/Attendance.model";
import { Marks } from "../models/Marks.model";

dotenv.config(); // ? THIS IS CRITICAL

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    throw new Error("MONGO_URI not defined in environment variables");
  }

  try {
    await mongoose.connect(mongoURI);
    await Attendance.syncIndexes();
    await Marks.syncIndexes();
    console.log("MongoDB connected");
    console.log("Attendance indexes synced");
    console.log("Marks indexes synced");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

export default connectDB;
