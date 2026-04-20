import sequelize from "../db.js";
import { DataTypes } from "sequelize";

const User = sequelize.define("user", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  firstName: { type: DataTypes.STRING, allowNull: false },
  secondName: { type: DataTypes.STRING, allowNull: false },
  username: { type: DataTypes.STRING, unique: true, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM("USER", "ADMIN"), defaultValue: "USER"},
  profileImage: { type: DataTypes.STRING, allowNull: true},
});

const Material = sequelize.define("material", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING, allowNull: false },
  materialCategory: { type: DataTypes.ENUM("ARTICLE", "LR", "THESES", "BOOK", "DATA"), allowNull: true },
  publishedDate: { type: DataTypes.DATE, allowNull: false },
  materialType: { type: DataTypes.ENUM("EDITOR", "UPLOAD"), allowNull: false },
  content: { type: DataTypes.JSON, allowNull: false },

  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
  },
});

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
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id"
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
  }
);

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
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false, 
      references: {
        model: User,
        key: "id"
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
      type: DataTypes.DECIMAL(5, 2)
    },
    score_trend: {
      type: DataTypes.DECIMAL(6, 4)
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
      type: DataTypes.DECIMAL(5, 4)
    },
    label_fault: {
      type: DataTypes.SMALLINT
    },
    refreshed_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    }
  },
  {
    tableName: "ml_student_course_features",
    timestamps: false,
  }
);

User.hasMany(Material, {
  foreignKey: "userId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Material.belongsTo(User, {
  foreignKey: "userId",
});

export {
  User,
  Material,
  MLStudentFeatures,
  MLStudentCourseFeatures,
};
