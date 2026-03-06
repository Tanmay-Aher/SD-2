import mongoose from "mongoose";
import bcrypt from "bcrypt";
import connectDB from "../config/database.js";
import { User } from "../models/User.model.js";
import { Student } from "../models/Student.model.js";

type SeedStudent = {
  rollNumber: number;
  firstName: string;
  lastName: string;
};

const DEFAULT_PASSWORD = "123456";
const SALT_ROUNDS = 10;
const DEPARTMENT = "Computer";

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

const buildEmail = (rollNumber: number): string =>
  `student${rollNumber}@csmss.com`;

const seedStudents = async (): Promise<void> => {
  let createdCount = 0;

  try {
    await connectDB();

    await Student.deleteMany({});
    await User.deleteMany({ role: "student" });
    console.log("Database wiped: deleted all students and all users with role=student");

    const studentIndexes = await Student.collection.indexes();
    for (const index of studentIndexes) {
      const indexName = index.name;
      if (!indexName) {
        continue;
      }
      const hasLegacyEmailKey =
        indexName === "email_1" ||
        (index.key && Object.prototype.hasOwnProperty.call(index.key, "email"));
      if (hasLegacyEmailKey) {
        await Student.collection.dropIndex(indexName);
        console.log(`Dropped legacy student index: ${indexName}`);
      }
    }

    for (const student of students) {
      const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);
      const now = new Date();

      const userInsert = await User.collection.insertOne({
        firstName: student.firstName,
        lastName: student.lastName,
        email: buildEmail(student.rollNumber),
        password: passwordHash,
        role: "student",
        createdAt: now,
        updatedAt: now,
      });

      await Student.create({
        user: userInsert.insertedId,
        firstName: student.firstName,
        lastName: student.lastName,
        rollNumber: student.rollNumber,
        class: DEPARTMENT,
      });

      createdCount++;
      console.log(
        `Created student ${student.rollNumber}: ${student.firstName} ${student.lastName}`
      );
    }

    console.log(`Seeding successful. Total students created: ${createdCount}`);
  } catch (error) {
    console.error("Student seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
};

void seedStudents();
