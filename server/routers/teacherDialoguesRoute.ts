import express from "express";
import multer from "multer";
import teacherDialoguesController from "../controllers/TeacherDialoguesController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import requireRoles from "../middleware/requireRoles.js";
import { ROLES } from "../constants/roles.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get(
  "/dialogues",
  authMiddleware,
  requireRoles(ROLES.TEACHER, ROLES.STUDENT),
  teacherDialoguesController.listTeacherDialogues,
);
router.post(
  "/dialogues",
  authMiddleware,
  requireRoles(ROLES.TEACHER),
  teacherDialoguesController.createOrGetDialogue,
);
router.get(
  "/dialogues/:id/messages",
  authMiddleware,
  requireRoles(ROLES.TEACHER, ROLES.STUDENT),
  teacherDialoguesController.getDialogueTimeline,
);
router.post(
  "/dialogues/:id/messages",
  authMiddleware,
  requireRoles(ROLES.TEACHER, ROLES.STUDENT),
  teacherDialoguesController.sendMessage,
);
router.post(
  "/dialogues/:id/messages/upload-pdf",
  authMiddleware,
  requireRoles(ROLES.STUDENT),
  upload.single("pdfFile"),
  teacherDialoguesController.uploadStudentPdf,
);
router.get(
  "/student/courses",
  authMiddleware,
  requireRoles(ROLES.STUDENT),
  teacherDialoguesController.listStudentCourses,
);
router.get(
  "/student/courses/:courseId/assignments",
  authMiddleware,
  requireRoles(ROLES.STUDENT),
  teacherDialoguesController.listCourseAssignments,
);
router.post(
  "/student/dialogues/by-course",
  authMiddleware,
  requireRoles(ROLES.STUDENT),
  teacherDialoguesController.createOrGetStudentDialogueByCourse,
);

router.get(
  "/dialogues/:id/drafts",
  authMiddleware,
  requireRoles(ROLES.TEACHER),
  teacherDialoguesController.listDrafts,
);
router.post(
  "/dialogues/:id/drafts/generate",
  authMiddleware,
  requireRoles(ROLES.TEACHER),
  teacherDialoguesController.generateAIFeedbackDraft,
);
router.post(
  "/drafts/:draftId/approve-send",
  authMiddleware,
  requireRoles(ROLES.TEACHER),
  teacherDialoguesController.approveAndSendDraft,
);
router.post(
  "/drafts/:draftId/reject",
  authMiddleware,
  requireRoles(ROLES.TEACHER),
  teacherDialoguesController.rejectDraft,
);

router.get(
  "/personalization/:studentId",
  authMiddleware,
  requireRoles(ROLES.TEACHER),
  teacherDialoguesController.getPersonalization,
);
router.put(
  "/personalization/:studentId",
  authMiddleware,
  requireRoles(ROLES.TEACHER),
  teacherDialoguesController.upsertPersonalization,
);

export default router;
