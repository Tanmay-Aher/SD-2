import { Router } from "express";
import {
  createTeacher,
  getAllTeachers,
  getMyTeacherProfile,
} from "../controllers/teacher.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";


const router = Router();

router.post("/", authenticate, authorize("admin"), createTeacher);
router.get("/", authenticate, authorize("admin"), getAllTeachers);
router.get("/me", authenticate, authorize("teacher"), getMyTeacherProfile);

export default router;