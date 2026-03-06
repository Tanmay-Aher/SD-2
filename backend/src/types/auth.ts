import { Request } from "express";

export interface JwtPayload {
  id: string;
  role: "admin" | "teacher" | "student";
  email: string; // ✅ ADD THIS
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}