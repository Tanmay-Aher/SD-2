import { Router } from "express";
import {
  createSubject,
  getAllSubjects,
} from "../controllers/subject.controller";

const router = Router();

router.post("/", createSubject);
router.get("/", getAllSubjects);

export default router;