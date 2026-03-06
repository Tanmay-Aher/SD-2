import dotenv from "dotenv";
import mongoose, { Types } from "mongoose";
import bcrypt from "bcrypt";
import connectDB from "../config/database.js";
import { User } from "../models/User.model.js";
import { Student } from "../models/Student.model.js";

dotenv.config();

type SeedStudent = {
  rollNumber: number;
  firstName: string;
  lastName: string;
};

const DEFAULT_PASSWORD = "123456";
const SALT_ROUNDS = 10;
const CLASS_NAME = "TY Computer";

const students: SeedStudent[] = [
  { rollNumber: 1, firstName: "YASH", lastName: "PATIL CHANDRASHEKHAR" },
  { rollNumber: 2, firstName: "TANUJA", lastName: "JUMBADE BHASKAR" },
  { rollNumber: 3, firstName: "MANALI", lastName: "KATHAR RAMESH" },
  { rollNumber: 4, firstName: "PRERNA", lastName: "SONWANE DIPAK" },
  { rollNumber: 5, firstName: "ADITI", lastName: "WAGH VISHNU" },
  { rollNumber: 6, firstName: "VAISHNAVI", lastName: "AGALE SHIVAJI" },
  { rollNumber: 7, firstName: "TANMAY", lastName: "AHER" },
  { rollNumber: 8, firstName: "AMRUTA", lastName: "AKOLKAR ANNASAHEB" },
  { rollNumber: 9, firstName: "PAYAL", lastName: "BADHE MACHHINDRA" },
  { rollNumber: 10, firstName: "SHREYA", lastName: "BHADARGE SATISH" },
  { rollNumber: 11, firstName: "BHAKTI", lastName: "BHAGWAT SAMBHAJI" },
  { rollNumber: 12, firstName: "NANDINI", lastName: "BHARDWAJ VIKRAM" },
  { rollNumber: 13, firstName: "DNYANESHWARI", lastName: "BHAVAR SHIVAJI" },
  { rollNumber: 14, firstName: "SAKSHI", lastName: "BHAVAR KAKASAHEB" },
  { rollNumber: 15, firstName: "SIDDHI", lastName: "BHAVSAR AMOL" },
  { rollNumber: 16, firstName: "VIVEK", lastName: "BHUSARE BHAUSAHEB" },
  { rollNumber: 17, firstName: "TANVI", lastName: "BORKAR ARVIND" },
  { rollNumber: 18, firstName: "KIRAN", lastName: "CHAPE RAMESHWAR" },
  { rollNumber: 19, firstName: "PRITI", lastName: "CHATHE VITTHAL" },
  { rollNumber: 20, firstName: "PRERNA", lastName: "DIGAMBAR DANDGE" },
  { rollNumber: 21, firstName: "RUPESH", lastName: "DANE ASHOK" },
  { rollNumber: 22, firstName: "PRANAV", lastName: "DAUD GAJANAN" },
  { rollNumber: 23, firstName: "KALYANI", lastName: "DEORE PRADIP" },
  { rollNumber: 24, firstName: "PARTH", lastName: "DHAMNE SUMEET" },
  { rollNumber: 25, firstName: "PRATHAMESH", lastName: "DIKE ARUN" },
  { rollNumber: 26, firstName: "PRANJAL", lastName: "EDKE SANTOSH" },
  { rollNumber: 27, firstName: "GAURAV", lastName: "ELIS PRAKASH" },
  { rollNumber: 28, firstName: "SANIKA", lastName: "ETHAPE ASHOK" },
  { rollNumber: 29, firstName: "SHIVANI", lastName: "FALKE PANDHARINATH" },
  { rollNumber: 30, firstName: "AKASH", lastName: "GAIKWAD KRUSHNA" },
  { rollNumber: 31, firstName: "OM", lastName: "GAIKWAD VIJAY" },
  { rollNumber: 32, firstName: "TEJASWINI", lastName: "GAIKWAD BHAGWAT" },
  { rollNumber: 33, firstName: "SHRAVAN", lastName: "GAURA SANTOSH" },
  { rollNumber: 34, firstName: "VAISHNAVI", lastName: "GAYKE BABURAO" },
  { rollNumber: 35, firstName: "AMEY", lastName: "GHADMODE ATUL" },
  { rollNumber: 36, firstName: "DIPIKA", lastName: "GIDHANE SUNIL" },
  { rollNumber: 37, firstName: "DIPALI", lastName: "GORE GORAKHNATH" },
  { rollNumber: 38, firstName: "VAIBHAV", lastName: "GORE SHRIRAM" },
  { rollNumber: 39, firstName: "SAHIL", lastName: "GUSINGE SAHEBSING" },
  { rollNumber: 40, firstName: "BHAKTI", lastName: "HINGMIRE ANAND" },
  { rollNumber: 41, firstName: "PRANALI", lastName: "HOLKAR PRAKASH" },
  { rollNumber: 42, firstName: "TEJAS", lastName: "IDHATE" },
  { rollNumber: 43, firstName: "SEVAK", lastName: "INGLE MADAN" },
  { rollNumber: 44, firstName: "MAYURI", lastName: "JADHAV SHUBHASH" },
  { rollNumber: 45, firstName: "POOJA", lastName: "JADHAV GANESH" },
  { rollNumber: 46, firstName: "ROHIT", lastName: "JADHAV PRAKASH" },
  { rollNumber: 47, firstName: "PRANAV", lastName: "JAISWAL SACHIN" },
  { rollNumber: 48, firstName: "AKSHATA", lastName: "JALHARE SUBHASH" },
  { rollNumber: 49, firstName: "SALONEE", lastName: "JARWAL SANTOSH" },
  { rollNumber: 50, firstName: "SHUBHAM", lastName: "JUMBAD GANESH" },
  { rollNumber: 51, firstName: "MAHESH", lastName: "KADAM MADHUKAR" },
  { rollNumber: 52, firstName: "OM", lastName: "KADAM RAJENDRA" },
  { rollNumber: 53, firstName: "DNYANESHWARI", lastName: "KAKDE DIGAMBAR" },
  { rollNumber: 54, firstName: "BHAKTI", lastName: "KALE VITTHAL" },
  { rollNumber: 55, firstName: "PIYUSH", lastName: "KALE GANESH" },
  { rollNumber: 56, firstName: "AASTHA", lastName: "KENDRE GAJENDRA" },
  { rollNumber: 57, firstName: "VAIBHAV", lastName: "KHATADE DATTU" },
  { rollNumber: 58, firstName: "PAYAL", lastName: "KHILLARE SHIVAJI" },
  { rollNumber: 59, firstName: "SAMIKSHA", lastName: "KHOLE KALYAN" },
  { rollNumber: 60, firstName: "NILAKSHI", lastName: "KOLHE DEVENDRA" },
  { rollNumber: 61, firstName: "PRATIKSHA", lastName: "KOTWALE PREMSING" },
  { rollNumber: 62, firstName: "ANUSHKA", lastName: "KULKARNI SANDEEP" },
  { rollNumber: 63, firstName: "OMKAR", lastName: "KULKARNI KALYAN" },
  { rollNumber: 64, firstName: "SANIKA", lastName: "KULKARNI SANTOSHRAO" },
  { rollNumber: 65, firstName: "SHRIDHAR", lastName: "KULKARNI DATTATRAY" },
  { rollNumber: 66, firstName: "SWAYAM", lastName: "KULKARNI RUSHIKESH" },
  { rollNumber: 67, firstName: "VEER", lastName: "KUMAVAT RAVINDRA" },
  { rollNumber: 68, firstName: "AVINASH", lastName: "KURALIYE PRAVIN" },
  { rollNumber: 69, firstName: "ROSHANI", lastName: "LAKKAS DADARAO" },
  { rollNumber: 70, firstName: "JAYSHRI", lastName: "MAHAJAN DNYANESHWAR" },
  { rollNumber: 71, firstName: "KARAN", lastName: "MAHAJAN KRUSHNA" },
  { rollNumber: 72, firstName: "GANESH", lastName: "MALPURE" },
  { rollNumber: 73, firstName: "DURGASING", lastName: "MANDAWAT" },
  { rollNumber: 74, firstName: "KRRISH", lastName: "MEHTA" },
];

const buildEmail = (firstName: string, rollNumber: number): string =>
  `${firstName.toLowerCase()}${rollNumber}@college.com`;

const createUserDirect = async (
  firstName: string,
  lastName: string,
  email: string
): Promise<Types.ObjectId> => {
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);
  const now = new Date();

  const result = await User.collection.insertOne({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    role: "student",
    createdAt: now,
    updatedAt: now,
  });

  return result.insertedId;
};

const seedStudents = async (): Promise<void> => {
  let createdCount = 0;
  let skippedCount = 0;

  try {
    await connectDB();
    console.log("MongoDB connected for seeding");

    for (const student of students) {
      const email = buildEmail(student.firstName, student.rollNumber);
      let userId: Types.ObjectId | null = null;
      let userCreatedInRun = false;

      try {
        const existingUser = await User.findOne({ email })
          .select("_id role")
          .lean();

        if (existingUser) {
          if (existingUser.role !== "student") {
            throw new Error(
              `Email ${email} already belongs to a non-student user`
            );
          }
          userId = existingUser._id as Types.ObjectId;
        } else {
          userId = await createUserDirect(
            student.firstName,
            student.lastName,
            email
          );
          userCreatedInRun = true;
        }

        const existingByUser = await Student.findOne({ user: userId })
          .select("_id rollNumber")
          .lean();
        if (existingByUser) {
          console.log(
            `Skipped roll ${student.rollNumber}: student already exists for ${email}`
          );
          skippedCount++;
          continue;
        }

        const existingByRoll = await Student.findOne({
          rollNumber: student.rollNumber,
        })
          .select("_id user")
          .lean();

        if (existingByRoll) {
          if (userCreatedInRun && userId) {
            await User.deleteOne({ _id: userId });
          }
          console.log(
            `Skipped roll ${student.rollNumber}: roll number already assigned to another student`
          );
          skippedCount++;
          continue;
        }

        await Student.create({
          user: userId,
          firstName: student.firstName,
          lastName: student.lastName,
          rollNumber: student.rollNumber,
          class: CLASS_NAME,
        });

        createdCount++;
        console.log(
          `Created student roll ${student.rollNumber}: ${student.firstName} (${email})`
        );
      } catch (studentError) {
        if (userCreatedInRun && userId) {
          await User.deleteOne({ _id: userId });
        }
        throw studentError;
      }
    }

    console.log(
      `Seeding complete. Created: ${createdCount}, Skipped: ${skippedCount}`
    );
  } catch (error) {
    console.error("Student seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
};

void seedStudents();
