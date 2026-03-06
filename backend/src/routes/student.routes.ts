import { Router } from "express";
import {
  getAllStudents,
  getStudentsByClass,
  getMyStudentProfile,
} from "../controllers/student.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

/* =========================
   TEACHER ROUTES
========================= */

// GET /api/students
router.get(
  "/",
  authenticate,
  authorize("teacher"),
  getAllStudents
);

// GET /api/students/class/:className
router.get(
  "/class/:className",
  authenticate,
  authorize("teacher"),
  getStudentsByClass
);

/* =========================
   STUDENT ROUTES
========================= */

// GET /api/students/me
router.get(
  "/me",
  authenticate,
  authorize("student"),
  getMyStudentProfile
);

export default router;