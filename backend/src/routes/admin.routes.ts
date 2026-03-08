import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { requireAdmin } from "../middleware/admin.middleware";
import {
  assignTeacherToSubject,
  createAdminUser,
  createSubjectAdmin,
  deleteAdminUser,
  deleteAnnouncementAdmin,
  deleteAssignmentAdmin,
  deleteStudentAdmin,
  deleteSubjectAdmin,
  getAdminOverview,
  getAdminUsers,
  getAnnouncementsAdmin,
  getAssignmentsAdmin,
  getAttendanceReportAdmin,
  getStudentsAdmin,
  getSubjectsAdmin,
  resetUserPassword,
  updateAdminUser,
  updateAnnouncementAdmin,
  updateStudentAdmin,
} from "../controllers/admin.controller";

const router = Router();

router.use(authenticate, requireAdmin);

router.get("/overview", getAdminOverview);

router.get("/users", getAdminUsers);
router.post("/users", createAdminUser);
router.put("/users/:id", updateAdminUser);
router.delete("/users/:id", deleteAdminUser);
router.patch("/users/:id/reset-password", resetUserPassword);

router.post("/subjects", createSubjectAdmin);
router.get("/subjects", getSubjectsAdmin);
router.put("/subjects/:id/assign-teacher", assignTeacherToSubject);
router.delete("/subjects/:id", deleteSubjectAdmin);

router.get("/students", getStudentsAdmin);
router.put("/students/:id", updateStudentAdmin);
router.delete("/students/:id", deleteStudentAdmin);

router.get("/assignments", getAssignmentsAdmin);
router.delete("/assignments/:id", deleteAssignmentAdmin);

router.get("/announcements", getAnnouncementsAdmin);
router.put("/announcements/:id", updateAnnouncementAdmin);
router.delete("/announcements/:id", deleteAnnouncementAdmin);

router.get("/attendance/report", getAttendanceReportAdmin);

export default router;
