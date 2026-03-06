import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth";

export const authorize =
  (...roles: Array<"admin" | "teacher" | "student">) =>
  (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    next();
    return;
  };
