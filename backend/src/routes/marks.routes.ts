import { Router } from "express";
import {
  updateMarks,
  getStudentMarks,
  getStudentSubjectProgressForTeacher,
} from "../controllers/marks.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.post("/update", authenticate, authorize("teacher"), updateMarks);
router.get("/my", authenticate, authorize("student"), getStudentMarks);
router.get(
  "/teacher/student/:studentId/progress",
  authenticate,
  authorize("teacher"),
  getStudentSubjectProgressForTeacher
);

export default router;
