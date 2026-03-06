import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import {
  getAdminOverview,
  getStudentOverview,
  getTeacherOverview,
} from "../controllers/dashboard.controller";

const router = Router();

router.get("/student-overview", authenticate, authorize("student"), getStudentOverview);
router.get("/teacher-overview", authenticate, authorize("teacher"), getTeacherOverview);
router.get("/admin-overview", authenticate, authorize("admin"), getAdminOverview);

export default router;
