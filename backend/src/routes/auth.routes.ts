import express from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User.model";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET as string;

router.post("/login", async (req, res): Promise<void> => {
  try {
    const { email, password } = req.body;

    // find user in DB
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    // compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    // generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
    return;
  }
});

// ------------------- SIGNUP ROUTE ------------------

router.post("/signup", async (req, res): Promise<void> => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    // 1. Basic validation
    if (!firstName || !lastName || !email || !password) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ message: "User already exists" });
      return;
    }

    // 3. Create new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role || "student" || "teacher" || "admin", // prevent undefined role
    });

    // 4. Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 5. Send response
    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
    return;
  }
});
export default router;
