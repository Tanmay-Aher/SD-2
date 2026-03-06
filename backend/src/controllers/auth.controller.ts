import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User.model";

/* =========================
   REGISTER CONTROLLER
========================= */
export const register = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    // 1️⃣ Validate input
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // 2️⃣ Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // 3️⃣ Check existing user
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // 4️⃣ Create user
    // ⚠️ Password hashing happens automatically in User.model.ts (pre-save hook)
    const user = await User.create({
      firstName,
      lastName,
      email: normalizedEmail,
      password,
      role: role || "student",
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({
      message: "Server error during registration",
    });
  }
};

/* =========================
   LOGIN CONTROLLER
========================= */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // 2️⃣ Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // 3️⃣ Find user WITH password
    const user = await User.findOne({ email: normalizedEmail }).select("+password");
    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // 4️⃣ Compare password
    const isPasswordValid = await (user as any).comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // 5️⃣ Generate JWT
    const token = jwt.sign(
  {
    id: user._id,
    role: user.role,
    email: user.email,   // 🔥 ADD THIS
  },
  process.env.JWT_SECRET as string,
  { expiresIn: "7d" }
);

    // 6️⃣ Send response
    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({
      message: "Server error during login",
    });
  }
};
