import express, { Response } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { AuthRequest } from "../types/auth";

const router = express.Router();

router.get("/me", authenticate, (req: AuthRequest, res: Response) => {
  res.status(200).json({
    success: true,
    user: req.user, // ✅ no error now
  });
});

router.get(
  "/admin-test",
  authenticate,
  authorize("admin"),
  (req: AuthRequest, res: Response) => {
    res.status(200).json({
      success: true,
      message: "Admin access granted",
    });
  }
);

export default router;