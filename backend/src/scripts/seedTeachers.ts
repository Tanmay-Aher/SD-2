import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/database.js";
import { User } from "../models/User.model.js";
import { Teacher } from "../models/Teacher.model.js";
import { Subject } from "../models/Subject.model.js";

dotenv.config();

type TeacherSeed = {
  firstName: string;
  lastName: string;
  email: string;
  subjectName: string;
  subjectCode: string;
  semester: number;
  department: string;
};

const DEFAULT_PASSWORD = "123456";

const teachersToSeed: TeacherSeed[] = [
  {
    firstName: "Management",
    lastName: "Teacher",
    email: "management.teacher@csmss.com",
    subjectName: "Management",
    subjectCode: "MGT",
    semester: 5,
    department: "Computer",
  },
  {
    firstName: "NIS",
    lastName: "Teacher",
    email: "nis.teacher@csmss.com",
    subjectName: "Network Information Security",
    subjectCode: "NIS",
    semester: 5,
    department: "Computer",
  },
  {
    firstName: "ETI",
    lastName: "Teacher",
    email: "eti.teacher@csmss.com",
    subjectName: "ETI",
    subjectCode: "ETI",
    semester: 5,
    department: "Computer",
  },
];

const seedTeachers = async (): Promise<void> => {
  try {
    await connectDB();
    console.log("MongoDB connected for teacher seeding");

    for (const item of teachersToSeed) {
      const normalizedEmail = item.email.trim().toLowerCase();

      let user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        user = await User.create({
          firstName: item.firstName,
          lastName: item.lastName,
          email: normalizedEmail,
          password: DEFAULT_PASSWORD,
          role: "teacher",
        });
        console.log(`Created user: ${normalizedEmail}`);
      } else if (user.role !== "teacher") {
        user.role = "teacher";
        await user.save();
        console.log(`Updated role to teacher: ${normalizedEmail}`);
      }

      let teacher = await Teacher.findOne({ user: user._id });
      if (!teacher) {
        teacher = await Teacher.create({
          user: user._id,
          firstName: item.firstName,
          lastName: item.lastName,
          email: normalizedEmail,
          department: item.department,
          subjects: [],
        });
        console.log(`Created teacher profile: ${normalizedEmail}`);
      }

      let subject = await Subject.findOne({
        $or: [{ code: item.subjectCode }, { name: item.subjectName }],
      });

      if (!subject) {
        subject = await Subject.create({
          code: item.subjectCode,
          name: item.subjectName,
          department: item.department,
          semester: item.semester,
          isActive: true,
          teachers: [],
        });
        console.log(`Created subject: ${item.subjectName}`);
      }

      if (!teacher.subjects.some((id) => String(id) === String(subject._id))) {
        teacher.subjects.push(subject._id as any);
        await teacher.save();
      }

      if (!subject.teachers.some((id) => String(id) === String(teacher._id))) {
        subject.teachers.push(teacher._id as any);
        await subject.save();
      }

      console.log(
        `Linked ${normalizedEmail} -> ${subject.name} (${subject.code})`
      );
    }

    console.log("Teacher seeding complete");
    console.log(`Default password for newly created users: ${DEFAULT_PASSWORD}`);
  } catch (error) {
    console.error("Teacher seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
};

void seedTeachers();
