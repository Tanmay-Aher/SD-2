import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import {
  createAssignment,
  getMyAssignments,
  getTeacherAssignments,
  markAssignmentCompleted,
} from "../controllers/assignment.controller";

const router = Router();

router.post("/create", authenticate, authorize("teacher"), createAssignment);
router.patch(
  "/mark-completed/:submissionId",
  authenticate,
  authorize("teacher"),
  markAssignmentCompleted
);
router.get("/my", authenticate, authorize("student"), getMyAssignments);
router.get("/teacher", authenticate, authorize("teacher"), getTeacherAssignments);

export default router;
