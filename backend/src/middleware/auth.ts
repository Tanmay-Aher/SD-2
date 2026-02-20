import { Request, Response } from "express";
import User from "../models/User";

export const register = async (req: Request, res: Response) => {
  console.log("REGISTER BODY 👉", req.body);

  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
  });

  return res.status(201).json({
    message: "User registered successfully",
    userId: user._id,
  });
};

// OPTIONAL — keep login stub so imports don’t break
export const login = async (req: Request, res: Response) => {
  return res.status(200).json({ message: "Login route working" });
};
