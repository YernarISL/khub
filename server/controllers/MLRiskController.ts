import type { NextFunction, Request, Response } from "express";
import { MLStudentCourseFeatures, MLStudentFeatures } from "../models/models.js";
import {
  aggregateCourseFeatures,
  mergeStudentAndCourseAgg,
  pickFeaturesForModel,
} from "../utils/buildMlStudentFeatureRow.js";

const ML_BASE = (process.env.ML_SERVICE_URL || "http://127.0.0.1:8001").replace(/\/$/, "");

let cachedFeatureColumns: string[] | null = null;

async function fetchFeatureColumns(): Promise<string[]> {
  if (cachedFeatureColumns?.length) return cachedFeatureColumns;
  const res = await fetch(`${ML_BASE}/meta`, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) {
    throw new Error(`ML service /meta returned ${res.status}`);
  }
  const data = (await res.json()) as { feature_columns?: string[] };
  if (!data.feature_columns?.length) {
    throw new Error("ML /meta: feature_columns missing or empty");
  }
  cachedFeatureColumns = data.feature_columns;
  return cachedFeatureColumns;
}

class MLRiskController {
  /**
   * POST /api/ml/dropout-risk  { "studentId": number }
   * Loads feature tables, builds the same row as in training, calls Python service.
   */
  async dropoutRisk(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = Number((req.body as { studentId?: unknown })?.studentId);
      if (!Number.isFinite(studentId) || studentId <= 0) {
        return res.status(400).json({ message: "studentId must be a positive integer" });
      }

      const [student, courses, featureColumns] = await Promise.all([
        MLStudentFeatures.findByPk(studentId, { raw: true }),
        MLStudentCourseFeatures.findAll({ where: { student_id: studentId }, raw: true }),
        fetchFeatureColumns(),
      ]);

      if (!student) {
        return res.status(404).json({ message: "Student features not found" });
      }

      const courseAgg = aggregateCourseFeatures(courses as unknown as Record<string, unknown>[]);
      const merged = mergeStudentAndCourseAgg(student as unknown as Record<string, unknown>, courseAgg);
      const features = pickFeaturesForModel(merged, featureColumns);

      const mlRes = await fetch(`${ML_BASE}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features }),
        signal: AbortSignal.timeout(15000),
      });

      const body = (await mlRes.json().catch(() => ({}))) as Record<string, unknown>;
      if (!mlRes.ok) {
        return res.status(502).json({
          message: "ML inference failed",
          detail: body,
        });
      }

      return res.json({
        studentId,
        risk_score_pct: body.risk_score_pct ?? body.risk_score,
        task_mode: body.task_mode,
        prediction: body.prediction,
      });
    } catch (e) {
      return next(e);
    }
  }
}

export default new MLRiskController();
