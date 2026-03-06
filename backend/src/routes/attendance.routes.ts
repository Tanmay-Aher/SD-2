import { Router } from "express";
import {
  markAttendance,
  getMyAttendance,
  getTeacherAttendance,
} from "../controllers/attendance.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

/* Teacher marks/updates attendance */
router.post(
  "/mark",
  authenticate,
  authorize("teacher"),
  markAttendance
);

/* Teacher views only their own attendance records */
router.get(
  "/teacher",
  authenticate,
  authorize("teacher"),
  getTeacherAttendance
);

/* Student views own attendance */
router.get(
  "/my",
  authenticate,
  authorize("student"),
  getMyAttendance
);

export default router;
