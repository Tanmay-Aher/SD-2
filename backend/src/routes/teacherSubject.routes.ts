import { Router } from "express";
import { assignSubjectToTeacher } from "../controllers/teacherSubject.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.post(
  "/assign",
  authenticate,
  authorize("admin"),
  assignSubjectToTeacher
);

export default router;