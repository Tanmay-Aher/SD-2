import { Request } from "express";

export interface JwtPayload {
  id: string;
  role: "admin" | "teacher" | "student";
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}