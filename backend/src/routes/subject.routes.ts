import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { createSubject, assignStudents } from "../controllers/subject.controller";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("admin"),
  createSubject
);

router.post(
  "/assign-students",
  authenticate,
  authorize("admin", "teacher"),
  assignStudents
);

export default router;