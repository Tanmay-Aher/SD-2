import { Router } from "express";
import { getStudentsByClass } from "../controllers/student.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.get(
  "/class/:className",
  authenticate,
  authorize("teacher"),
  getStudentsByClass
);

export default router;