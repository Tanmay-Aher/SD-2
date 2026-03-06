import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import {
  createAnnouncement,
  getMyAnnouncements,
  getTeacherAnnouncements,
  getTeacherAssignedSubject,
} from "../controllers/announcement.controller";

const router = Router();

router.post("/create", authenticate, authorize("teacher"), createAnnouncement);
router.get("/my", authenticate, authorize("student"), getMyAnnouncements);
router.get("/teacher", authenticate, authorize("teacher"), getTeacherAnnouncements);
router.get(
  "/teacher/subject",
  authenticate,
  authorize("teacher"),
  getTeacherAssignedSubject
);

export default router;
