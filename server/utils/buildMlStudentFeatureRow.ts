/**
 * Mirrors ml/notebook/train.ipynb: aggregate_course_features + merge with student row.
 * Output keys use DB/snake_case names expected by the training CSV / model.
 */

type Row = Record<string, unknown>;

const BOOL_MAP: Record<string, number> = {
  t: 1,
  f: 0,
  true: 1,
  false: 0,
  "1": 1,
  "0": 0,
};

function normalizeBoolish(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "boolean") return v ? 1 : 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const s = String(v).trim().toLowerCase();
  if (Object.prototype.hasOwnProperty.call(BOOL_MAP, s)) {
    return BOOL_MAP[s] as number;
  }
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function num(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function mean(vals: (number | null)[]): number | null {
  const xs = vals.filter((x): x is number => x !== null && !Number.isNaN(x));
  if (!xs.length) return null;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function nunique(ids: number[]): number {
  return new Set(ids).size;
}

/**
 * One row per course from `ml_student_course_features` (plain Sequelize object).
 */
export function aggregateCourseFeatures(courseRows: Row[]): Row {
  if (!courseRows.length) {
    return {
      course_id_nunique: 0,
      teacher_id_nunique: 0,
    };
  }

  const courseIds = courseRows.map((r) => Number(r.course_id)).filter(Number.isFinite);
  const teacherIds = courseRows.map((r) => Number(r.teacher_id)).filter(Number.isFinite);

  const isCompletedNum = courseRows.map((r) => normalizeBoolish(r.is_completed));

  const completion = courseRows.map((r) => num(r.completion_rate));
  const avgScore = courseRows.map((r) => num(r.avg_score));
  const scoreTrend = courseRows.map((r) => num(r.score_trend));
  const totalEvents = courseRows.map((r) => num(r.total_events));
  const daysActive = courseRows.map((r) => num(r.days_active_on_course));
  const daysSince = courseRows.map((r) => num(r.days_since_last_activity));
  const subCount = courseRows.map((r) => num(r.submission_count));
  const lateCount = courseRows.map((r) => num(r.late_submission_count));
  const engagement = courseRows.map((r) => num(r.engagement_score));

  return {
    course_id_nunique: nunique(courseIds),
    teacher_id_nunique: nunique(teacherIds),
    course_mean_completion_rate: mean(completion),
    course_mean_is_completed: mean(isCompletedNum),
    course_mean_avg_score: mean(avgScore),
    course_mean_score_trend: mean(scoreTrend),
    course_mean_total_events: mean(totalEvents),
    course_mean_days_active_on_course: mean(daysActive),
    course_mean_days_since_last_activity: mean(daysSince),
    course_mean_submission_count: mean(subCount),
    course_mean_late_submission_count: mean(lateCount),
    course_mean_engagement_score: mean(engagement),
  };
}

export function mergeStudentAndCourseAgg(studentRow: Row, courseAgg: Row): Row {
  const { refreshed_at: _r, label_at_fault: _la, label_dropout: _ld, user_id: _u, ...stu } = studentRow;
  return { ...stu, ...courseAgg };
}

export function pickFeaturesForModel(merged: Row, featureColumns: string[]): Row {
  const out: Row = {};
  for (const col of featureColumns) {
    if (Object.prototype.hasOwnProperty.call(merged, col)) {
      out[col] = merged[col];
    } else {
      out[col] = null;
    }
  }
  return out;
}
