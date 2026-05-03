import sequelize from "../../db.js";
import { DataTypes } from "sequelize";

const MLStudentCourseFeatures = sequelize.define(
  "MLStudentCourseFeatures",
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
    course_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: "lms_courses",
        key: "id",
      },
    },
    teacher_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: "lms_teachers",
        key: "id",
      },
    },
    completion_rate: {
      type: DataTypes.DECIMAL(5, 4),
      defaultValue: 0,
    },
    is_completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    avg_score: {
      type: DataTypes.DECIMAL(5, 2),
    },
    score_trend: {
      type: DataTypes.DECIMAL(6, 4),
    },
    total_events: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    days_active_on_course: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    days_since_last_activity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    submission_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    late_submission_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    engagement_score: {
      type: DataTypes.DECIMAL(5, 4),
    },
    label_fault: {
      type: DataTypes.SMALLINT,
    },
    refreshed_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "ml_student_course_features",
    timestamps: false,
  },
);

export default MLStudentCourseFeatures;