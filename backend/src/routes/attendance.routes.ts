import { Router } from "express";
import {
  saveAttendance,
  getAttendanceForDate,
  getMyAttendance,
  getTeacherAttendance,
} from "../controllers/attendance.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

/* Teacher saves/updates attendance (bulk) */
router.post(
  "/save",
  authenticate,
  authorize("teacher"),
  saveAttendance
);

/* Teacher fetches attendance for a date */
router.get(
  "/teacher/date",
  authenticate,
  authorize("teacher"),
  getAttendanceForDate
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
