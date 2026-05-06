import type { Request, Response } from "express";
import { Op } from "sequelize";
import pdfParse from "pdf-parse-new";
import { GoogleGenAI } from "@google/genai";
import {
  AIFeedbackDraft,
  DialogueAttachment,
  DialogueMessage,
  LMSCourse,
  LMSEvent,
  LMSTeacher,
  StudentPersonalization,
  StudentUserMapping,
  TeacherStudentDialogue,
  User,
} from "../models/models.js";
import { ROLES } from "../constants/roles.js";
import sequelize from "../db.js";
import { QueryTypes } from "sequelize";

const MAX_PDF_SIZE_BYTES = 8 * 1024 * 1024;

const apiKey = process.env.GEMINI_API_KEY || "";
const GEMINI_MODELS = (process.env.GEMINI_MODELS || process.env.GEMINI_MODEL || "gemini-2.0-flash,gemini-2.5-flash")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const GEMINI_RETRY_MS = Number(process.env.GEMINI_RETRY_MS || 30000);
const genAI = new GoogleGenAI({ apiKey });

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const parsePdfBuffer = async (buffer: Buffer) => {
  const parseFunction = typeof pdfParse === "function" ? pdfParse : (pdfParse as { default?: Function }).default;
  if (!parseFunction) {
    throw new Error("PDF parser is unavailable");
  }
  const parsed = await parseFunction(buffer);
  return String(parsed?.text ?? "").trim();
};

const normalizeGrade = (value: unknown) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  return Math.max(0, Math.min(10, Number(numeric.toFixed(2))));
};

const ASSIGNMENT_EVENT_TYPES = ["assignment_submit", "assignment_open", "assignment_view"];

class TeacherDialoguesController {
  constructor() {
    this.listStudentCourses = this.listStudentCourses.bind(this);
    this.listCourseAssignments = this.listCourseAssignments.bind(this);
    this.createOrGetStudentDialogueByCourse = this.createOrGetStudentDialogueByCourse.bind(this);
    this.uploadStudentPdf = this.uploadStudentPdf.bind(this);
    this.generateAIFeedbackDraft = this.generateAIFeedbackDraft.bind(this);
  }

  private async resolveMappedLmsStudentId(userId: number, userEmail?: string | null) {
    const mapping = await StudentUserMapping.findOne({
      where: { user_id: userId },
      attributes: ["student_id"],
    });
    if (mapping) {
      const studentId = Number(mapping.get("student_id"));
      if (Number.isFinite(studentId)) {
        return studentId;
      }
    }

    // Fallback for environments where mapping table is not populated yet.
    if (userEmail) {
      const lmsStudent = await sequelize.query<{ id: number }>(
        `
          SELECT s.id
          FROM lms_students s
          WHERE LOWER(s.email) = LOWER(:email)
          LIMIT 1
        `,
        {
          type: QueryTypes.SELECT,
          replacements: { email: userEmail },
        },
      );
      if (lmsStudent[0]?.id) {
        return Number(lmsStudent[0].id);
      }
    }

    return null;
  }

  private async createDraftFromMessage({
    dialogueId,
    messageId,
    teacherId,
    studentId,
  }: {
    dialogueId: number;
    messageId: number;
    teacherId: number;
    studentId: number;
  }) {
    const [studentMessage, personalization] = await Promise.all([
      DialogueMessage.findByPk(messageId, {
        include: [{ model: DialogueAttachment, as: "attachments" }],
      }),
      StudentPersonalization.findOne({ where: { teacherId, studentId } }),
    ]);

    const attachment = ((studentMessage?.get("attachments") as any[]) ?? []).find(
      (item: any) => item.parseStatus === "parsed",
    );
    if (!studentMessage) {
      return null;
    }
    const messageBodyText = String(studentMessage.get("body") ?? "").trim();
    const assignmentText = String(attachment?.extractedText ?? "").trim();
    if (!messageBodyText && !assignmentText) return null;

    const prompt = [
      "You are an academic assistant helping a teacher review student assignment.",
      "Return JSON only with keys: feedback_text, grade_0_10, confidence, key_points.",
      "First key_points item must be a short assignment summary.",
      `Teacher personalization: ${personalization?.get("note") ?? "No note provided."}`,
      `Student message: ${messageBodyText || "No text provided."}`,
      `Assignment text: ${assignmentText || "No file text provided."}`,
    ].join("\n\n");

    const startedAt = Date.now();
    let raw = "";
    let usedModel = GEMINI_MODELS[0] || "gemini-2.0-flash";
    let lastError: unknown = null;

    for (const modelName of GEMINI_MODELS) {
      try {
        const result = await genAI.models.generateContent({
          model: modelName,
          contents: prompt,
        });
        raw = String(result.text ?? "").trim();
        usedModel = modelName;
        lastError = null;
        break;
      } catch (error: any) {
        lastError = error;
        const status = Number(error?.status ?? error?.code ?? 0);
        const message = String(error?.message ?? "");
        const isRateLimit = status === 429 || message.includes("RESOURCE_EXHAUSTED");
        const isRetryable = isRateLimit || status >= 500;
        if (isRetryable) {
          await sleep(GEMINI_RETRY_MS);
          try {
            const retryResult = await genAI.models.generateContent({
              model: modelName,
              contents: prompt,
            });
            raw = String(retryResult.text ?? "").trim();
            usedModel = modelName;
            lastError = null;
            break;
          } catch (retryError) {
            lastError = retryError;
          }
        }
      }
    }

    if (lastError) {
      throw lastError;
    }

    const latencyMs = Date.now() - startedAt;

    let parsed: any = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {
        feedback_text: raw,
        grade_0_10: null,
        confidence: null,
        key_points: [],
      };
    }

    return AIFeedbackDraft.create({
      dialogueId,
      messageId: Number(studentMessage.get("id")),
      generatedByTeacherId: teacherId,
      status: "ready_for_review",
      feedbackText: String(parsed.feedback_text ?? "").trim() || "No feedback generated",
      grade_0_10: normalizeGrade(parsed.grade_0_10),
      confidence: Number.isFinite(Number(parsed.confidence)) ? Number(parsed.confidence) : null,
      keyPoints: Array.isArray(parsed.key_points) ? parsed.key_points.slice(0, 6) : [],
      promptSnapshot: prompt.slice(0, 12000),
      modelName: usedModel,
      latencyMs,
    });
  }

  async listStudentCourses(req: Request, res: Response) {
    try {
      const requester = req.user;
      if (!requester || requester.role !== ROLES.STUDENT) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const lmsStudentId = await this.resolveMappedLmsStudentId(requester.id, requester.email);
      if (!lmsStudentId) return res.json([]);

      const courses = await sequelize.query<{
        id: number;
        title: string;
        code: string;
        teacher_id: number;
      }>(
        `
          SELECT c.id, c.title, c.code, c.teacher_id
          FROM lms_courses c
          JOIN lms_enrollments e ON e.course_id = c.id
          WHERE e.student_id = :studentId
          ORDER BY c.title ASC
        `,
        {
          type: QueryTypes.SELECT,
          replacements: { studentId: lmsStudentId },
        },
      );

      return res.json(courses.map((course) => ({
        id: Number(course.id),
        title: String(course.title),
        code: String(course.code),
        teacherLmsId: Number(course.teacher_id),
      })));
    } catch (error) {
      console.error("LIST STUDENT COURSES ERROR:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async listCourseAssignments(req: Request, res: Response) {
    try {
      const requester = req.user;
      const courseId = Number(req.params.courseId);
      if (!requester || requester.role !== ROLES.STUDENT) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      if (!Number.isFinite(courseId)) {
        return res.status(422).json({ message: "Invalid course id" });
      }

      const lmsStudentId = await this.resolveMappedLmsStudentId(requester.id, requester.email);
      if (!lmsStudentId) return res.json([]);

      let events = await LMSEvent.findAll({
        where: {
          student_id: lmsStudentId,
          course_id: courseId,
          event_type: { [Op.in]: ASSIGNMENT_EVENT_TYPES },
        },
        attributes: ["id", "event_type", "event_at"],
        order: [["event_at", "DESC"]],
        limit: 200,
      });

      if (!events.length) {
        events = await LMSEvent.findAll({
          where: {
            student_id: lmsStudentId,
            course_id: courseId,
          },
          attributes: ["id", "event_type", "event_at"],
          order: [["event_at", "DESC"]],
          limit: 200,
        });
      }

      const dedup = new Map<string, { id: number; label: string; eventType: string; eventAt: string }>();
      events.forEach((event) => {
        const eventId = Number(event.get("id"));
        const eventType = String(event.get("event_type"));
        const eventAtRaw = event.get("event_at");
        const eventAtIso = eventAtRaw ? new Date(String(eventAtRaw)).toISOString() : null;
        if (!eventAtIso) return;
        const label = `${eventType} (${new Date(eventAtIso).toLocaleDateString("en-CA")})`;
        if (!dedup.has(label)) {
          dedup.set(label, {
            id: eventId,
            label,
            eventType,
            eventAt: eventAtIso,
          });
        }
      });

      return res.json(Array.from(dedup.values()));
    } catch (error) {
      console.error("LIST COURSE ASSIGNMENTS ERROR:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async createOrGetStudentDialogueByCourse(req: Request, res: Response) {
    try {
      const requester = req.user;
      const courseId = Number((req.body as { courseId?: number }).courseId);
      if (!requester || requester.role !== ROLES.STUDENT) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      if (!Number.isFinite(courseId)) {
        return res.status(422).json({ message: "courseId is required" });
      }

      const lmsStudentId = await this.resolveMappedLmsStudentId(requester.id, requester.email);
      if (!lmsStudentId) {
        return res.status(422).json({ message: "Student is not mapped to LMS account" });
      }

      const course = await LMSCourse.findOne({
        where: { id: courseId },
        attributes: ["id", "teacher_id"],
        include: [{
          association: "students",
          attributes: [],
          through: { attributes: [] },
          where: { id: lmsStudentId },
          required: true,
        }],
      });
      if (!course) {
        return res.status(404).json({ message: "Course not found for student" });
      }

      const teacher = await LMSTeacher.findByPk(Number(course.get("teacher_id")), {
        attributes: ["email"],
      });
      if (!teacher) {
        return res.status(404).json({ message: "Course teacher not found in LMS" });
      }

      const teacherUser = await User.findOne({
        where: {
          email: String(teacher.get("email")),
          role: ROLES.TEACHER,
        },
        attributes: ["id"],
      });
      const fallbackTeacherUser = teacherUser
        ? null
        : await User.findOne({
            where: { role: ROLES.TEACHER },
            attributes: ["id"],
            order: [["id", "ASC"]],
          });
      const linkedTeacherUser = teacherUser ?? fallbackTeacherUser;
      if (!linkedTeacherUser) {
        return res.status(422).json({ message: "No teacher user account available" });
      }

      const [dialogue] = await TeacherStudentDialogue.findOrCreate({
        where: {
          teacherId: Number(linkedTeacherUser.get("id")),
          studentId: requester.id,
        },
        defaults: {
          teacherId: Number(linkedTeacherUser.get("id")),
          studentId: requester.id,
        },
      });

      return res.json({ dialogueId: Number(dialogue.get("id")) });
    } catch (error) {
      console.error("CREATE STUDENT DIALOGUE BY COURSE ERROR:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async listTeacherDialogues(req: Request, res: Response) {
    try {
      const requester = req.user;
      const query = String(req.query.query ?? "").trim();
      if (!requester) return res.status(401).json({ message: "Unauthorized" });

      if (requester.role === ROLES.TEACHER) {
        const rows = await sequelize.query<{
          dialogue_id: number;
          student_id: number;
          username: string;
          first_name: string | null;
          second_name: string | null;
          last_message_at: string | null;
          last_message_preview: string | null;
        }>(
          `
            SELECT
              d.id AS dialogue_id,
              d.student_id,
              u.username,
              u."firstName" AS first_name,
              u."secondName" AS second_name,
              d.last_message_at,
              (
                SELECT LEFT(m.body, 90)
                FROM dialogue_messages m
                WHERE m.dialogue_id = d.id
                ORDER BY m.created_at DESC
                LIMIT 1
              ) AS last_message_preview
            FROM teacher_student_dialogues d
            JOIN users u ON u.id = d.student_id
            WHERE d.teacher_id = :teacherId
              AND (
                :query = ''
                OR u.username ILIKE :queryLike
                OR u."firstName" ILIKE :queryLike
                OR u."secondName" ILIKE :queryLike
              )
            ORDER BY d.last_message_at DESC NULLS LAST, d.id DESC
          `,
          {
            type: QueryTypes.SELECT,
            replacements: {
              teacherId: requester.id,
              query,
              queryLike: `%${query}%`,
            },
          },
        );

        return res.json(rows.map((row) => ({
          dialogueId: row.dialogue_id,
          studentId: row.student_id,
          studentUsername: row.username,
          studentFullName: `${row.first_name ?? ""} ${row.second_name ?? ""}`.trim(),
          participantLabel: row.username,
          lastMessagePreview: row.last_message_preview ?? "",
          lastMessageAt: row.last_message_at,
        })));
      }

      if (requester.role === ROLES.STUDENT) {
        const rows = await sequelize.query<{
          dialogue_id: number;
          teacher_id: number;
          username: string;
          first_name: string | null;
          second_name: string | null;
          last_message_at: string | null;
          last_message_preview: string | null;
        }>(
          `
            SELECT
              d.id AS dialogue_id,
              d.teacher_id,
              u.username,
              u."firstName" AS first_name,
              u."secondName" AS second_name,
              d.last_message_at,
              (
                SELECT LEFT(m.body, 90)
                FROM dialogue_messages m
                WHERE m.dialogue_id = d.id
                ORDER BY m.created_at DESC
                LIMIT 1
              ) AS last_message_preview
            FROM teacher_student_dialogues d
            JOIN users u ON u.id = d.teacher_id
            WHERE d.student_id = :studentId
              AND (
                :query = ''
                OR u.username ILIKE :queryLike
                OR u."firstName" ILIKE :queryLike
                OR u."secondName" ILIKE :queryLike
              )
            ORDER BY d.last_message_at DESC NULLS LAST, d.id DESC
          `,
          {
            type: QueryTypes.SELECT,
            replacements: {
              studentId: requester.id,
              query,
              queryLike: `%${query}%`,
            },
          },
        );

        return res.json(rows.map((row) => ({
          dialogueId: row.dialogue_id,
          teacherId: row.teacher_id,
          teacherUsername: row.username,
          teacherFullName: `${row.first_name ?? ""} ${row.second_name ?? ""}`.trim(),
          participantLabel: row.username,
          lastMessagePreview: row.last_message_preview ?? "",
          lastMessageAt: row.last_message_at,
        })));
      }

      return res.status(403).json({ message: "Forbidden" });
    } catch (error) {
      console.error("LIST TEACHER DIALOGUES ERROR:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async createOrGetDialogue(req: Request, res: Response) {
    try {
      const teacherId = req.user?.id;
      const studentId = Number((req.body as { studentId?: number }).studentId);
      if (!teacherId) return res.status(401).json({ message: "Unauthorized" });
      if (!Number.isFinite(studentId)) return res.status(422).json({ message: "studentId is required" });

      const student = await User.findByPk(studentId, { attributes: ["id", "role"] });
      if (!student || student.get("role") !== ROLES.STUDENT) {
        return res.status(404).json({ message: "Student not found" });
      }

      const [dialogue] = await TeacherStudentDialogue.findOrCreate({
        where: { teacherId, studentId },
        defaults: { teacherId, studentId },
      });
      return res.json({ dialogueId: Number(dialogue.get("id")) });
    } catch (error) {
      console.error("CREATE OR GET DIALOGUE ERROR:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async getDialogueTimeline(req: Request, res: Response) {
    try {
      const requester = req.user;
      const dialogueId = Number(req.params.id);
      if (!requester) return res.status(401).json({ message: "Unauthorized" });
      if (!Number.isFinite(dialogueId)) return res.status(422).json({ message: "Invalid dialogue id" });

      const dialogue = await TeacherStudentDialogue.findByPk(dialogueId);
      if (!dialogue) return res.status(404).json({ message: "Dialogue not found" });

      const teacherId = Number(dialogue.get("teacherId"));
      const studentId = Number(dialogue.get("studentId"));
      if (requester.role === ROLES.TEACHER && requester.id !== teacherId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      if (requester.role === ROLES.STUDENT && requester.id !== studentId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const messages = await DialogueMessage.findAll({
        where: { dialogueId },
        include: [{ model: DialogueAttachment, as: "attachments" }],
        order: [["created_at", "ASC"]],
      });

      return res.json(
        messages.map((msg) => ({
          id: Number(msg.get("id")),
          dialogueId: Number(msg.get("dialogueId")),
          senderId: Number(msg.get("senderId")),
          senderRole: msg.get("senderRole"),
          source: msg.get("source"),
          status: msg.get("status"),
          body: msg.get("body"),
          grade_0_10: msg.get("grade_0_10"),
          sentByTeacher: Boolean(msg.get("sentByTeacher")),
          createdAt: msg.get("createdAt"),
          attachments: ((msg.get("attachments") as any[]) ?? []).map((a: any) => ({
            id: Number(a.id),
            originalName: a.originalName,
            mimeType: a.mimeType,
            parseStatus: a.parseStatus,
          })),
        })),
      );
    } catch (error) {
      console.error("GET DIALOGUE TIMELINE ERROR:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async sendMessage(req: Request, res: Response) {
    try {
      const requester = req.user;
      const dialogueId = Number(req.params.id);
      const { body } = req.body as { body?: string };
      if (!requester) return res.status(401).json({ message: "Unauthorized" });
      if (!Number.isFinite(dialogueId)) return res.status(422).json({ message: "Invalid dialogue id" });
      if (!body?.trim()) return res.status(422).json({ message: "Message body is required" });

      const dialogue = await TeacherStudentDialogue.findByPk(dialogueId);
      if (!dialogue) return res.status(404).json({ message: "Dialogue not found" });

      const teacherId = Number(dialogue.get("teacherId"));
      const studentId = Number(dialogue.get("studentId"));
      if (requester.role === ROLES.TEACHER && requester.id !== teacherId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      if (requester.role === ROLES.STUDENT && requester.id !== studentId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const senderRole = requester.role === ROLES.TEACHER ? ROLES.TEACHER : ROLES.STUDENT;
      const message = await DialogueMessage.create({
        dialogueId,
        senderId: requester.id,
        senderRole,
        source: "MANUAL",
        status: "approved_sent",
        body: body.trim(),
        sentByTeacher: requester.role === ROLES.TEACHER,
      });

      dialogue.set("lastMessageAt", new Date());
      await dialogue.save();

      return res.status(201).json({
        id: Number(message.get("id")),
        dialogueId,
      });
    } catch (error) {
      console.error("SEND MESSAGE ERROR:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async uploadStudentPdf(req: Request, res: Response) {
    try {
      const requester = req.user;
      const dialogueId = Number(req.params.id);
      if (!requester) return res.status(401).json({ message: "Unauthorized" });
      if (requester.role !== ROLES.STUDENT) return res.status(403).json({ message: "Only students can upload" });
      if (!Number.isFinite(dialogueId)) return res.status(422).json({ message: "Invalid dialogue id" });
      const dialogue = await TeacherStudentDialogue.findByPk(dialogueId);
      if (!dialogue || Number(dialogue.get("studentId")) !== requester.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { courseId, assignmentRef, assignmentLabel, text: messageText } = req.body as {
        courseId?: string;
        assignmentRef?: string;
        assignmentLabel?: string;
        text?: string;
      };
      const trimmedMessageText = String(messageText ?? "").trim();
      if (!req.file && !trimmedMessageText) {
        return res.status(422).json({ message: "Either text or PDF file is required" });
      }
      if (req.file && req.file.mimetype !== "application/pdf") {
        return res.status(422).json({ message: "Only PDF files are supported" });
      }
      if (req.file && req.file.size > MAX_PDF_SIZE_BYTES) {
        return res.status(422).json({ message: "PDF is too large" });
      }

      const parsedCourseId = Number(courseId);
      const uploadText = req.file ? await parsePdfBuffer(req.file.buffer) : "";
      const parseStatus = uploadText ? "parsed" : "failed";
      const messageBody = [
        req.file ? "Student submitted assignment PDF" : "Student submitted assignment text",
        Number.isFinite(parsedCourseId) ? `Course: ${parsedCourseId}` : null,
        assignmentLabel ? `Assignment: ${String(assignmentLabel).trim()}` : null,
        assignmentRef ? `AssignmentRef: ${String(assignmentRef).trim()}` : null,
        trimmedMessageText ? `Student note: ${trimmedMessageText}` : null,
      ]
        .filter(Boolean)
        .join("\n");
      const message = await DialogueMessage.create({
        dialogueId,
        senderId: requester.id,
        senderRole: ROLES.STUDENT,
        source: "MANUAL",
        status: "approved_sent",
        body: messageBody,
      });

      const attachment = req.file
        ? await DialogueAttachment.create({
            messageId: Number(message.get("id")),
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            sizeBytes: req.file.size,
            parseStatus,
            extractedText: uploadText || null,
          })
        : null;

      dialogue.set("lastMessageAt", new Date());
      await dialogue.save();

      let autoDraft: Awaited<ReturnType<typeof this.createDraftFromMessage>> | null = null;
      let draftGenerationFailed = false;
      try {
        autoDraft = await this.createDraftFromMessage({
          dialogueId,
          messageId: Number(message.get("id")),
          teacherId: Number(dialogue.get("teacherId")),
          studentId: requester.id,
        });
      } catch (generationError) {
        draftGenerationFailed = true;
        console.error("AUTO DRAFT GENERATION ERROR:", generationError);
        const errorReason = generationError instanceof Error
          ? generationError.message
          : "Unknown AI generation error";
        autoDraft = await AIFeedbackDraft.create({
          dialogueId,
          messageId: Number(message.get("id")),
          generatedByTeacherId: Number(dialogue.get("teacherId")),
          status: "failed",
          feedbackText: null,
          grade_0_10: null,
          confidence: null,
          keyPoints: [],
          promptSnapshot: "auto-draft generation failed",
          modelName: GEMINI_MODELS[0] || "gemini-2.0-flash",
          latencyMs: 0,
          errorReason: errorReason.slice(0, 500),
        });
      }

      return res.status(201).json({
        messageId: Number(message.get("id")),
        attachmentId: attachment ? Number(attachment.get("id")) : null,
        draftGenerationFailed,
        autoDraft: autoDraft
          ? {
              id: Number(autoDraft.get("id")),
              status: autoDraft.get("status"),
              createdAt: autoDraft.get("createdAt"),
            }
          : null,
      });
    } catch (error) {
      console.error("UPLOAD STUDENT PDF ERROR:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async upsertPersonalization(req: Request, res: Response) {
    try {
      const teacherId = req.user?.id;
      if (!teacherId || req.user?.role !== ROLES.TEACHER) return res.status(401).json({ message: "Unauthorized" });

      const studentId = Number(req.params.studentId);
      const note = String((req.body as { note?: string }).note ?? "").trim();
      if (!Number.isFinite(studentId)) return res.status(422).json({ message: "Invalid studentId" });
      if (!note) return res.status(422).json({ message: "note is required" });
      if (note.length > 1000) return res.status(422).json({ message: "note max length is 1000" });

      const [entry, created] = await StudentPersonalization.findOrCreate({
        where: { teacherId, studentId },
        defaults: { teacherId, studentId, note, updatedBy: teacherId },
      });

      if (!created) {
        entry.set("note", note);
        entry.set("updatedBy", teacherId);
        await entry.save();
      }

      return res.json({ id: Number(entry.get("id")), note: entry.get("note"), updatedAt: entry.get("updatedAt") });
    } catch (error) {
      console.error("UPSERT PERSONALIZATION ERROR:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async getPersonalization(req: Request, res: Response) {
    try {
      const teacherId = req.user?.id;
      if (!teacherId || req.user?.role !== ROLES.TEACHER) return res.status(401).json({ message: "Unauthorized" });

      const studentId = Number(req.params.studentId);
      if (!Number.isFinite(studentId)) return res.status(422).json({ message: "Invalid studentId" });

      const entry = await StudentPersonalization.findOne({ where: { teacherId, studentId } });
      return res.json(entry ? { id: Number(entry.get("id")), note: entry.get("note"), updatedAt: entry.get("updatedAt") } : null);
    } catch (error) {
      console.error("GET PERSONALIZATION ERROR:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async generateAIFeedbackDraft(req: Request, res: Response) {
    try {
      const teacherId = req.user?.id;
      if (!teacherId || req.user?.role !== ROLES.TEACHER) return res.status(401).json({ message: "Unauthorized" });
      const dialogueId = Number(req.params.id);
      if (!Number.isFinite(dialogueId)) return res.status(422).json({ message: "Invalid dialogue id" });

      const dialogue = await TeacherStudentDialogue.findByPk(dialogueId);
      if (!dialogue || Number(dialogue.get("teacherId")) !== teacherId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const [latestStudentPdfMessage, recentDraftCount] = await Promise.all([
        DialogueMessage.findOne({
          where: { dialogueId, senderRole: ROLES.STUDENT },
          include: [{ model: DialogueAttachment, as: "attachments" }],
          order: [["created_at", "DESC"]],
        }),
        AIFeedbackDraft.count({
          where: {
            dialogueId,
            generatedByTeacherId: teacherId,
            createdAt: { [Op.gte]: new Date(Date.now() - 60 * 1000) },
          },
        }),
      ]);

      if (recentDraftCount >= 3) {
        return res.status(429).json({ message: "Too many generations, please wait a minute" });
      }

      const attachment = ((latestStudentPdfMessage?.get("attachments") as any[]) ?? []).find(
        (a: any) => a.parseStatus === "parsed",
      );
      if (!latestStudentPdfMessage || !attachment) {
        return res.status(422).json({ message: "No parsed student PDF found in dialogue" });
      }
      const draft = await this.createDraftFromMessage({
        dialogueId,
        messageId: Number(latestStudentPdfMessage.get("id")),
        teacherId,
        studentId: Number(dialogue.get("studentId")),
      });
      if (!draft) {
        return res.status(422).json({ message: "No parsed student PDF found in dialogue" });
      }

      return res.status(201).json({
        id: Number(draft.get("id")),
        dialogueId: Number(draft.get("dialogueId")),
        messageId: Number(draft.get("messageId")),
        status: draft.get("status"),
        feedbackText: draft.get("feedbackText"),
        grade_0_10: draft.get("grade_0_10"),
        confidence: draft.get("confidence"),
        keyPoints: draft.get("keyPoints") ?? [],
        refusalReason: draft.get("refusalReason"),
        errorReason: draft.get("errorReason"),
        createdAt: draft.get("createdAt"),
      });
    } catch (error) {
      console.error("GENERATE AI DRAFT ERROR:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async listDrafts(req: Request, res: Response) {
    try {
      const teacherId = req.user?.id;
      const dialogueId = Number(req.params.id);
      if (!teacherId || req.user?.role !== ROLES.TEACHER) return res.status(401).json({ message: "Unauthorized" });
      if (!Number.isFinite(dialogueId)) return res.status(422).json({ message: "Invalid dialogue id" });

      const dialogue = await TeacherStudentDialogue.findByPk(dialogueId);
      if (!dialogue || Number(dialogue.get("teacherId")) !== teacherId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const drafts = await AIFeedbackDraft.findAll({
        where: { dialogueId, generatedByTeacherId: teacherId },
        order: [["created_at", "DESC"]],
        limit: 20,
      });

      return res.json(
        drafts.map((draft) => ({
          id: Number(draft.get("id")),
          dialogueId: Number(draft.get("dialogueId")),
          messageId: Number(draft.get("messageId")),
          status: draft.get("status"),
          feedbackText: draft.get("feedbackText"),
          grade_0_10: draft.get("grade_0_10"),
          confidence: draft.get("confidence"),
          keyPoints: draft.get("keyPoints") ?? [],
          refusalReason: draft.get("refusalReason"),
          errorReason: draft.get("errorReason"),
          createdAt: draft.get("createdAt"),
        })),
      );
    } catch (error) {
      console.error("LIST DRAFTS ERROR:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async approveAndSendDraft(req: Request, res: Response) {
    try {
      const teacherId = req.user?.id;
      if (!teacherId || req.user?.role !== ROLES.TEACHER) return res.status(401).json({ message: "Unauthorized" });

      const draftId = Number(req.params.draftId);
      const { feedbackText, grade_0_10 } = req.body as { feedbackText?: string; grade_0_10?: number };
      if (!Number.isFinite(draftId)) return res.status(422).json({ message: "Invalid draft id" });

      const draft = await AIFeedbackDraft.findByPk(draftId);
      if (!draft || Number(draft.get("generatedByTeacherId")) !== teacherId) {
        return res.status(404).json({ message: "Draft not found" });
      }
      if (draft.get("status") !== "ready_for_review") {
        return res.status(409).json({ message: "Draft already processed" });
      }

      const dialogueId = Number(draft.get("dialogueId"));
      const dialogue = await TeacherStudentDialogue.findByPk(dialogueId);
      if (!dialogue || Number(dialogue.get("teacherId")) !== teacherId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const finalText = String(feedbackText ?? draft.get("feedbackText") ?? "").trim();
      if (!finalText) return res.status(422).json({ message: "Feedback text is required" });

      const message = await DialogueMessage.create({
        dialogueId,
        senderId: teacherId,
        senderRole: "AI",
        source: "AI_DRAFT",
        status: "approved_sent",
        body: finalText,
        grade_0_10: normalizeGrade(grade_0_10 ?? draft.get("grade_0_10")),
        sentByTeacher: true,
      });

      draft.set("status", "approved_sent");
      await draft.save();
      dialogue.set("lastMessageAt", new Date());
      await dialogue.save();

      return res.status(201).json({ messageId: Number(message.get("id")), draftId: Number(draft.get("id")) });
    } catch (error) {
      console.error("APPROVE DRAFT ERROR:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async rejectDraft(req: Request, res: Response) {
    try {
      const teacherId = req.user?.id;
      if (!teacherId || req.user?.role !== ROLES.TEACHER) return res.status(401).json({ message: "Unauthorized" });

      const draftId = Number(req.params.draftId);
      if (!Number.isFinite(draftId)) return res.status(422).json({ message: "Invalid draft id" });

      const draft = await AIFeedbackDraft.findByPk(draftId);
      if (!draft || Number(draft.get("generatedByTeacherId")) !== teacherId) {
        return res.status(404).json({ message: "Draft not found" });
      }

      draft.set("status", "rejected");
      await draft.save();
      return res.json({ message: "Draft rejected" });
    } catch (error) {
      console.error("REJECT DRAFT ERROR:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }
}

export default new TeacherDialoguesController();
