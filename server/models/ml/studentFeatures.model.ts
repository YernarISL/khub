import sequelize from "../../db.js";
import { DataTypes } from "sequelize";

const MLStudentFeatures = sequelize.define(
  "MLStudentFeatures",
  {
    student_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: "lms_students",
        key: "id",
      },
    },
    enrollment_year: { type: DataTypes.INTEGER, allowNull: false },
    total_courses_enrolled: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    courses_completed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    courses_abandoned: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    avg_score_overall: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    score_trend: { type: DataTypes.DECIMAL(6, 4), allowNull: true },
    total_active_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    days_since_last_activity: { type: DataTypes.INTEGER, allowNull: true },
    avg_weekly_events: { type: DataTypes.DECIMAL(6, 2), allowNull: true },
    avg_session_gap_days: { type: DataTypes.DECIMAL(6, 2), allowNull: true },
    late_submission_rate: { type: DataTypes.DECIMAL(5, 4), allowNull: true },
    label_at_fault: { type: DataTypes.SMALLINT, allowNull: true },
    label_dropout: { type: DataTypes.SMALLINT, allowNull: true },
    refreshed_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "ml_student_features",
    timestamps: false,
  },
);

export default MLStudentFeatures;