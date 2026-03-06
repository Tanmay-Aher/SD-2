import { Router } from "express";
import { updateMarks, getStudentMarks } from "../controllers/marks.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.post("/update", authenticate, authorize("teacher"), updateMarks);
router.get("/my", authenticate, authorize("student"), getStudentMarks);

export default router;
