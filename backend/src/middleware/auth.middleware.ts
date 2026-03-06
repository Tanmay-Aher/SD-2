import jwt from "jsonwebtoken";
import { Response, NextFunction } from "express";
import { AuthRequest, JwtPayload } from "../types/auth";
import { User } from "../models/User.model";

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];

  const run = async () => {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    const user = await User.findById(decoded.id).select("_id role email").lean();
    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    req.user = {
      id: String(user._id),
      role: user.role,
      email: user.email,
    };

    next();
    return;
  };

  run().catch(() => {
    res.status(401).json({ message: "Invalid token" });
    return;
  });
};
