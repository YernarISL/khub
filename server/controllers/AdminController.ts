import type { Request, Response } from "express";
import {
  User,
  Material,
  RoleChangeRequest,
  MLStudentCourseFeatures,
  MLStudentFeatures,
  StudentUserMapping,
} from "../models/models.js";
import { ROLES, type Role } from "../constants/roles.js";
import sequelize from "../db.js";
import { QueryTypes } from "sequelize";
import {
  aggregateCourseFeatures,
  mergeStudentAndCourseAgg,
  pickFeaturesForModel,
} from "../utils/buildMlStudentFeatureRow.js";

const REQUEST_STATUSES = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
} as const;

const clampPercentage = (value: number) => {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(100, Math.max(0, Number(value.toFixed(1))));
};

const getFallbackTrendMonths = (size = 6) => {
  const formatter = new Intl.DateTimeFormat("en-US", { month: "short" });
  const now = new Date();
  const months: string[] = [];

  for (let index = size - 1; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    months.push(formatter.format(date));
  }

  return months;
};

const ML_BASE = (process.env.ML_SERVICE_URL || "http://127.0.0.1:8001").replace(/\/$/, "");
const HIGH_RISK_THRESHOLD_PCT = 65;
let cachedFeatureColumns: string[] | null = null;

const fetchFeatureColumns = async (): Promise<string[]> => {
  if (cachedFeatureColumns?.length) {
    return cachedFeatureColumns;
  }

  const response = await fetch(`${ML_BASE}/meta`, { signal: AbortSignal.timeout(5000) });
  if (!response.ok) {
    throw new Error(`ML service /meta returned ${response.status}`);
  }

  const payload = (await response.json()) as { feature_columns?: string[] };
  if (!payload.feature_columns?.length) {
    throw new Error("ML /meta: feature_columns missing or empty");
  }

  cachedFeatureColumns = payload.feature_columns;
  return cachedFeatureColumns;
};

const toRiskPercent = (value: unknown) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 0;
  }
  if (numeric <= 1) {
    return clampPercentage(numeric * 100);
  }
  return clampPercentage(numeric);
};

class AdminController {
  async getUsers(req: Request, res: Response) {
    const { limit = 20, offset = 0 } = req.query as {
      limit?: string | number;
      offset?: string | number;
    };

    const users = await User.findAll({
      limit: Number(limit),
      offset: Number(offset),
      attributes: ["id", "username", "email", "role"],
      order: [["id", "DESC"]],
    });
    res.json(users);
  }

  async getMaterials(req: Request, res: Response) {
    const { limit = 20, offset = 0 } = req.query as {
      limit?: string | number;
      offset?: string | number;
    };

    const materials = await Material.findAll({
      include: {
        model: User,
        attributes: ["firstName", "secondName"],
      },
      limit: Number(limit),
      offset: Number(offset),
      attributes: ["id", "title", "materialCategory", "userId", "createdAt", "updatedAt"],
      order: [["id", "DESC"]],
    });
    res.json(materials);
  }

  async deleteMaterial(req: Request, res: Response) {
    try {
      console.log("DELETE MATERIAL ID:", req.params.id);
      const { id } = req.params;
      
      if (typeof id !== "string") {
        return res.status(400).json({ message: "Invalid material ID" });
      }

      const material = await Material.findByPk(id);
      console.log("FOUND MATERIAL:", material);
      if (!material) {
        return res.status(404).json({ message: "Material not found" });
      }

      await material.destroy();

      return res.json({ message: "Material deleted successfully" });
    } catch (error) {
      console.error("DELETE MATERIAL ERROR:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async updateUserRole(req: Request, res: Response) {
    try {
      const requester = req.user;
      const { id } = req.params;
      const { role } = req.body as { role?: string };

      if (!requester) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!id || Number.isNaN(Number(id))) {
        return res.status(422).json({ message: "Invalid user id" });
      }

      if (!role) {
        return res.status(422).json({ message: "Role is required" });
      }

      const assignableRolesByRole: Partial<Record<Role, Role[]>> = {
        [ROLES.ADMIN]: [ROLES.MANAGER, ROLES.USER],
      };

      const allowedRoles = assignableRolesByRole[requester.role] ?? [];
      if (!allowedRoles.includes(role as (typeof allowedRoles)[number])) {
        return res.status(403).json({ message: "You cannot assign this role" });
      }

      const targetUser = await User.findByPk(Number(id), {
        attributes: ["id", "username", "email", "role"],
      });

      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const targetUserId = Number(targetUser.get("id"));
      if (targetUserId === requester.id) {
        return res.status(403).json({ message: "Cannot change your own role" });
      }

      targetUser.set("role", role);
      await targetUser.save();

      return res.json({
        message: "User role updated successfully",
        data: targetUser,
      });
    } catch (error) {
      console.error("UPDATE USER ROLE ERROR:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async getRoleRequests(req: Request, res: Response) {
    try {
      const { status = REQUEST_STATUSES.PENDING, limit = 50, offset = 0 } = req.query as {
        status?: string;
        limit?: string | number;
        offset?: string | number;
      };

      const requests = await RoleChangeRequest.findAll({
        where: { status },
        include: [
          {
            model: User,
            as: "requestUser",
            attributes: ["id", "username", "email", "role"],
          },
          {
            model: User,
            as: "reviewer",
            attributes: ["id", "username", "email"],
          },
        ],
        limit: Number(limit),
        offset: Number(offset),
        order: [["created_at", "DESC"]],
      });

      return res.json(requests);
    } catch (error) {
      console.error("GET ROLE REQUESTS ERROR:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async approveRoleRequest(req: Request, res: Response) {
    try {
      const requester = req.user;
      const { id } = req.params;

      if (!requester) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!id || Number.isNaN(Number(id))) {
        return res.status(422).json({ message: "Invalid request id" });
      }

      const result = await sequelize.transaction(async (transaction) => {
        const roleRequest = await RoleChangeRequest.findByPk(Number(id), { transaction, lock: true });
        if (!roleRequest) {
          return { statusCode: 404, payload: { message: "Request not found" } };
        }

        if (roleRequest.get("status") !== REQUEST_STATUSES.PENDING) {
          return { statusCode: 409, payload: { message: "Request already processed" } };
        }

        const userId = Number(roleRequest.get("userId"));
        const requestedRole = String(roleRequest.get("requestedRole"));
        const targetUser = await User.findByPk(userId, { transaction });
        if (!targetUser) {
          return { statusCode: 404, payload: { message: "User not found" } };
        }

        targetUser.set("role", requestedRole);
        await targetUser.save({ transaction });

        if (requestedRole === ROLES.STUDENT) {
          const externalIdRaw = String(roleRequest.get("externalId") ?? "").trim();
          const lmsStudentId = Number(externalIdRaw);

          if (Number.isFinite(lmsStudentId) && lmsStudentId > 0) {
            const lmsStudent = await sequelize.query<{ id: number }>(
              `
                SELECT id
                FROM lms_students
                WHERE id = :studentId
                LIMIT 1
              `,
              {
                type: QueryTypes.SELECT,
                transaction,
                replacements: { studentId: lmsStudentId },
              },
            );

            if (lmsStudent.length > 0) {
              await StudentUserMapping.upsert(
                {
                  student_id: lmsStudentId,
                  user_id: userId,
                },
                { transaction },
              );
            }
          }
        }

        roleRequest.set("status", REQUEST_STATUSES.APPROVED);
        roleRequest.set("reviewedBy", requester.id);
        roleRequest.set("reviewedAt", new Date());
        roleRequest.set("reviewNote", null);
        await roleRequest.save({ transaction });

        return {
          statusCode: 200,
          payload: {
            message: "Role request approved",
            data: roleRequest,
          },
        };
      });

      return res.status(result.statusCode).json(result.payload);
    } catch (error) {
      console.error("APPROVE ROLE REQUEST ERROR:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async rejectRoleRequest(req: Request, res: Response) {
    try {
      const requester = req.user;
      const { id } = req.params;
      const { reviewNote } = req.body as { reviewNote?: string };

      if (!requester) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!id || Number.isNaN(Number(id))) {
        return res.status(422).json({ message: "Invalid request id" });
      }

      if (!reviewNote?.trim()) {
        return res.status(422).json({ message: "reviewNote is required" });
      }

      const roleRequest = await RoleChangeRequest.findByPk(Number(id));
      if (!roleRequest) {
        return res.status(404).json({ message: "Request not found" });
      }

      if (roleRequest.get("status") !== REQUEST_STATUSES.PENDING) {
        return res.status(409).json({ message: "Request already processed" });
      }

      roleRequest.set("status", REQUEST_STATUSES.REJECTED);
      roleRequest.set("reviewedBy", requester.id);
      roleRequest.set("reviewedAt", new Date());
      roleRequest.set("reviewNote", reviewNote.trim());
      await roleRequest.save();

      return res.json({
        message: "Role request rejected",
        data: roleRequest,
      });
    } catch (error) {
      console.error("REJECT ROLE REQUEST ERROR:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async getAnalyticsOverview(_req: Request, res: Response) {
    const payload = {
      kpis: {
        activeStudents: 0,
        avgCompletionPct: 0,
        highRiskStudents: 0,
        interventionSuccessPct: 0,
      },
      trend: [] as Array<{ month: string; predictedPct: number; actualPct: number }>,
      priorityInterventions: [] as Array<{
        studentId: number;
        studentName: string;
        courseName: string;
        riskScorePct: number;
        reason: string;
        priority: "HIGH" | "MEDIUM";
      }>,
      meta: {
        kpisSource: "fallback",
        trendSource: "fallback",
        interventionsSource: "fallback",
        generatedAt: new Date().toISOString(),
      },
    };

    try {
      try {
        const approvedStudentRoleRequests = await sequelize.query<{
          user_id: number;
          external_id: string;
        }>(
          `
            SELECT user_id, external_id
            FROM role_change_requests
            WHERE status = 'APPROVED'
              AND requested_role = 'STUDENT'
            ORDER BY created_at DESC
            LIMIT 200
          `,
          { type: QueryTypes.SELECT },
        );

        for (const row of approvedStudentRoleRequests) {
          const userId = Number(row.user_id);
          const studentId = Number(row.external_id);
          if (!Number.isFinite(userId) || !Number.isFinite(studentId) || studentId <= 0) {
            continue;
          }

          const lmsStudent = await sequelize.query<{ id: number }>(
            `
              SELECT id
              FROM lms_students
              WHERE id = :studentId
              LIMIT 1
            `,
            { type: QueryTypes.SELECT, replacements: { studentId } },
          );
          if (lmsStudent.length === 0) {
            continue;
          }

          const existingByStudent = await StudentUserMapping.findByPk(studentId);
          if (existingByStudent && Number(existingByStudent.get("user_id")) !== userId) {
            continue;
          }

          const existingByUser = await StudentUserMapping.findOne({
            where: { user_id: userId },
          });
          if (existingByUser && Number(existingByUser.get("student_id")) !== studentId) {
            continue;
          }

          if (!existingByStudent && !existingByUser) {
            await StudentUserMapping.create({
              student_id: studentId,
              user_id: userId,
            });
          }
        }
      } catch (error) {
        console.error("ANALYTICS MAPPING BACKFILL:", error);
      }

      try {
        const [activeStudentsRow] = await sequelize.query<{ value: number }>(
          `
            SELECT COUNT(DISTINCT sumap.user_id)::int AS value
            FROM student_user_mapping sumap
            JOIN lms_enrollments e ON e.student_id = sumap.student_id
          `,
          { type: QueryTypes.SELECT },
        );
        const [avgCompletionRow] = await sequelize.query<{ value: number }>(
          `
            SELECT COALESCE(AVG(completion_rate), 0)::float * 100 AS value
            FROM ml_student_course_features mscf
            JOIN student_user_mapping sumap ON sumap.student_id = mscf.student_id
          `,
          { type: QueryTypes.SELECT },
        );
        const [highRiskRow] = await sequelize.query<{ value: number }>(
          `
            SELECT COUNT(*)::int AS value
            FROM ml_student_features msf
            JOIN student_user_mapping sumap ON sumap.student_id = msf.student_id
            WHERE COALESCE(label_dropout, 0) = 1
              OR COALESCE(days_since_last_activity, 0) >= 21
          `,
          { type: QueryTypes.SELECT },
        );
        const [interventionSuccessRow] = await sequelize.query<{ value: number }>(
          `
            SELECT
              CASE
                WHEN COUNT(*) = 0 THEN 0
                ELSE (SUM(CASE WHEN COALESCE(score_trend, 0) > 0 THEN 1 ELSE 0 END)::float / COUNT(*)::float) * 100
              END::float AS value
            FROM ml_student_features msf
            JOIN student_user_mapping sumap ON sumap.student_id = msf.student_id
          `,
          { type: QueryTypes.SELECT },
        );

        payload.kpis = {
          activeStudents: Number(activeStudentsRow?.value ?? 0),
          avgCompletionPct: clampPercentage(Number(avgCompletionRow?.value ?? 0)),
          highRiskStudents: Number(highRiskRow?.value ?? 0),
          interventionSuccessPct: clampPercentage(Number(interventionSuccessRow?.value ?? 0)),
        };
        payload.meta.kpisSource = "live";
      } catch (error) {
        console.error("ANALYTICS KPI FALLBACK:", error);
      }

      try {
        const [avgTrendRow] = await sequelize.query<{ value: number }>(
          `
            SELECT COALESCE(AVG(score_trend), 0)::float AS value
            FROM ml_student_features msf
            JOIN student_user_mapping sumap ON sumap.student_id = msf.student_id
          `,
          { type: QueryTypes.SELECT },
        );

        const trendRows = await sequelize.query<{ month_label: string; actual_pct: number }>(
          `
            SELECT
              TO_CHAR(DATE_TRUNC('month', event_at), 'Mon') AS month_label,
              COALESCE(AVG(event_score), 0)::float AS actual_pct
            FROM lms_events
            JOIN student_user_mapping sumap ON sumap.student_id = lms_events.student_id
            WHERE event_score IS NOT NULL
            GROUP BY DATE_TRUNC('month', event_at)
            ORDER BY DATE_TRUNC('month', event_at) DESC
            LIMIT 6
          `,
          { type: QueryTypes.SELECT },
        );

        const sortedRows = [...trendRows].reverse();
        const avgTrend = Number(avgTrendRow?.value ?? 0);
        const computedTrend = sortedRows.map((row, index) => {
          const actualPct = clampPercentage(Number(row.actual_pct ?? 0));
          const predictedPct = clampPercentage(actualPct + avgTrend * 100 * (0.45 + index * 0.07));
          return {
            month: row.month_label,
            predictedPct,
            actualPct,
          };
        });

        payload.trend =
          computedTrend.length > 0
            ? computedTrend
            : getFallbackTrendMonths().map((month) => ({
                month,
                predictedPct: 0,
                actualPct: 0,
              }));
        payload.meta.trendSource = computedTrend.length > 0 ? "live" : "fallback";
      } catch (error) {
        console.error("ANALYTICS TREND FALLBACK:", error);
        payload.trend = getFallbackTrendMonths().map((month) => ({
          month,
          predictedPct: 0,
          actualPct: 0,
        }));
      }

      try {
        const featureColumns = await fetchFeatureColumns();
        const interventionRows = await sequelize.query<{
          user_id: number;
          username: string;
          student_id: number;
          student_name: string;
          avg_score_overall: number | null;
          days_since_last_activity: number | null;
          completion_rate: number | null;
          course_title: string | null;
        }>(
          `
            SELECT
              sumap.user_id,
              u.username,
              msf.student_id,
              s.full_name AS student_name,
              msf.avg_score_overall,
              msf.days_since_last_activity,
              course_info.completion_rate,
              course_info.course_title
            FROM ml_student_features msf
            JOIN student_user_mapping sumap ON sumap.student_id = msf.student_id
            JOIN users u ON u.id = sumap.user_id
            JOIN lms_students s ON s.id = msf.student_id
            LEFT JOIN LATERAL (
              SELECT
                mscf.completion_rate,
                c.title AS course_title
              FROM ml_student_course_features mscf
              JOIN lms_courses c ON c.id = mscf.course_id
              WHERE mscf.student_id = msf.student_id
              ORDER BY mscf.completion_rate ASC NULLS FIRST, mscf.days_since_last_activity DESC
              LIMIT 1
            ) course_info ON TRUE
            ORDER BY COALESCE(msf.days_since_last_activity, 0) DESC
            LIMIT 12
          `,
          { type: QueryTypes.SELECT },
        );

        const riskRows = await Promise.all(
          interventionRows.map(async (row) => {
            const studentFeatures = await MLStudentFeatures.findByPk(row.student_id, { raw: true });
            if (!studentFeatures) {
              return null;
            }

            const courseFeatures = await MLStudentCourseFeatures.findAll({
              where: { student_id: row.student_id },
              raw: true,
            });
            const courseAgg = aggregateCourseFeatures(courseFeatures as unknown as Record<string, unknown>[]);
            const merged = mergeStudentAndCourseAgg(
              studentFeatures as unknown as Record<string, unknown>,
              courseAgg,
            );
            const features = pickFeaturesForModel(merged, featureColumns);

            const mlResponse = await fetch(`${ML_BASE}/predict`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ features }),
              signal: AbortSignal.timeout(15000),
            });
            if (!mlResponse.ok) {
              return null;
            }

            const mlPayload = (await mlResponse.json().catch(() => ({}))) as Record<string, unknown>;
            const riskScorePct = toRiskPercent(mlPayload.risk_score_pct ?? mlPayload.risk_score);
            const inactivity = Number(row.days_since_last_activity ?? 0);
            const completionRate = Number(row.completion_rate ?? 0) * 100;
            const reason =
              inactivity >= 14
                ? "Missed recent activity and declining consistency"
                : completionRate < 45
                  ? "Low completion progress on current course"
                  : "Model predicts increased dropout risk";

            return {
              studentId: Number(row.user_id),
              studentName: row.username ?? row.student_name,
              courseName: row.course_title ?? "Unknown course",
              riskScorePct,
              reason,
              priority: (riskScorePct >= 80 ? "HIGH" : "MEDIUM") as "HIGH" | "MEDIUM",
            };
          }),
        );

        const ranked = riskRows
          .filter((row): row is NonNullable<typeof row> => row !== null)
          .sort((a, b) => b.riskScorePct - a.riskScorePct)
          .slice(0, 5);

        payload.priorityInterventions = ranked;
        payload.kpis.highRiskStudents = riskRows.filter(
          (row) => row !== null && row.riskScorePct >= HIGH_RISK_THRESHOLD_PCT,
        ).length;
        payload.meta.interventionsSource = ranked.length > 0 ? "live" : "fallback";
      } catch (error) {
        console.error("ANALYTICS INTERVENTIONS FALLBACK:", error);
      }

      return res.json(payload);
    } catch (error) {
      console.error("GET ANALYTICS OVERVIEW ERROR:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }
}

export default new AdminController();