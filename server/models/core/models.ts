import sequelize from "../../db.js";
import { DataTypes } from "sequelize";
import { ALL_ROLES, ROLES } from "../../constants/roles.js";

const REQUEST_STATUSES = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"] as const;
const DIALOGUE_MESSAGE_STATUSES = [
  "draft_ai",
  "draft_teacher",
  "ready_for_review",
  "approved_sent",
  "rejected",
] as const;

const User = sequelize.define("user", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  firstName: { type: DataTypes.STRING, allowNull: false },
  secondName: { type: DataTypes.STRING, allowNull: false },
  username: { type: DataTypes.STRING, unique: true, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM(...ALL_ROLES), defaultValue: ROLES.USER },
  profileImage: { type: DataTypes.STRING, allowNull: true },
});

const Material = sequelize.define("material", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING, allowNull: false },
  materialCategory: {
    type: DataTypes.ENUM("ARTICLE", "LR", "THESES", "BOOK", "DATA"),
    allowNull: true,
  },
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

const RoleChangeRequest = sequelize.define(
  "role_change_request",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    requestedRole: {
      type: DataTypes.ENUM(ROLES.STUDENT, ROLES.TEACHER),
      allowNull: false,
      field: "requested_role",
    },
    fullName: { type: DataTypes.STRING, allowNull: false, field: "full_name" },
    externalId: { type: DataTypes.STRING, allowNull: false, field: "external_id" },
    status: {
      type: DataTypes.ENUM(...REQUEST_STATUSES),
      allowNull: false,
      defaultValue: "PENDING",
    },
    reviewNote: { type: DataTypes.TEXT, allowNull: true, field: "review_note" },
    reviewedAt: { type: DataTypes.DATE, allowNull: true, field: "reviewed_at" },
    organizationId: { type: DataTypes.INTEGER, allowNull: true, field: "organization_id" },
    assignedManagerId: { type: DataTypes.INTEGER, allowNull: true, field: "assigned_manager_id" },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "user_id",
      references: {
        model: User,
        key: "id",
      },
    },
    reviewedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "reviewed_by",
      references: {
        model: User,
        key: "id",
      },
    },
  },
  {
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

const TeacherStudentDialogue = sequelize.define(
  "teacher_student_dialogue",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    teacherId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "teacher_id",
      references: { model: User, key: "id" },
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "student_id",
      references: { model: User, key: "id" },
    },
    lastMessageAt: { type: DataTypes.DATE, allowNull: true, field: "last_message_at" },
  },
  { createdAt: "created_at", updatedAt: "updated_at" },
);

const DialogueMessage = sequelize.define(
  "dialogue_message",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    dialogueId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "dialogue_id",
      references: { model: TeacherStudentDialogue, key: "id" },
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "sender_id",
      references: { model: User, key: "id" },
    },
    senderRole: {
      type: DataTypes.ENUM(ROLES.TEACHER, ROLES.STUDENT, "AI"),
      allowNull: false,
      field: "sender_role",
    },
    source: {
      type: DataTypes.ENUM("MANUAL", "AI_DRAFT"),
      allowNull: false,
      defaultValue: "MANUAL",
    },
    status: {
      type: DataTypes.ENUM(...DIALOGUE_MESSAGE_STATUSES),
      allowNull: false,
      defaultValue: "approved_sent",
    },
    body: { type: DataTypes.TEXT, allowNull: false },
    grade_0_10: { type: DataTypes.DECIMAL(4, 2), allowNull: true },
    sentByTeacher: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: "sent_by_teacher" },
  },
  { createdAt: "created_at", updatedAt: "updated_at" },
);

const DialogueAttachment = sequelize.define(
  "dialogue_attachment",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    messageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "message_id",
      references: { model: DialogueMessage, key: "id" },
    },
    originalName: { type: DataTypes.STRING, allowNull: false, field: "original_name" },
    mimeType: { type: DataTypes.STRING, allowNull: false, field: "mime_type" },
    sizeBytes: { type: DataTypes.INTEGER, allowNull: false, field: "size_bytes" },
    parseStatus: {
      type: DataTypes.ENUM("pending", "parsed", "failed"),
      allowNull: false,
      defaultValue: "pending",
      field: "parse_status",
    },
    extractedText: { type: DataTypes.TEXT, allowNull: true, field: "extracted_text" },
  },
  { createdAt: "created_at", updatedAt: "updated_at" },
);

const AIFeedbackDraft = sequelize.define(
  "ai_feedback_draft",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    dialogueId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "dialogue_id",
      references: { model: TeacherStudentDialogue, key: "id" },
    },
    messageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "message_id",
      references: { model: DialogueMessage, key: "id" },
    },
    generatedByTeacherId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "generated_by_teacher_id",
      references: { model: User, key: "id" },
    },
    status: {
      type: DataTypes.ENUM("ready_for_review", "approved_sent", "rejected", "failed"),
      allowNull: false,
      defaultValue: "ready_for_review",
    },
    feedbackText: { type: DataTypes.TEXT, allowNull: true, field: "feedback_text" },
    grade_0_10: { type: DataTypes.DECIMAL(4, 2), allowNull: true },
    confidence: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    keyPoints: { type: DataTypes.JSONB, allowNull: true, field: "key_points" },
    promptSnapshot: { type: DataTypes.TEXT, allowNull: true, field: "prompt_snapshot" },
    modelName: { type: DataTypes.STRING, allowNull: true, field: "model_name" },
    refusalReason: { type: DataTypes.TEXT, allowNull: true, field: "refusal_reason" },
    errorReason: { type: DataTypes.TEXT, allowNull: true, field: "error_reason" },
    latencyMs: { type: DataTypes.INTEGER, allowNull: true, field: "latency_ms" },
    tokenUsage: { type: DataTypes.INTEGER, allowNull: true, field: "token_usage" },
  },
  { createdAt: "created_at", updatedAt: "updated_at" },
);

const StudentPersonalization = sequelize.define(
  "student_personalization",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    teacherId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "teacher_id",
      references: { model: User, key: "id" },
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "student_id",
      references: { model: User, key: "id" },
    },
    note: { type: DataTypes.TEXT, allowNull: false },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "updated_by",
      references: { model: User, key: "id" },
    },
  },
  { createdAt: "created_at", updatedAt: "updated_at" },
);

User.hasMany(Material, {
  foreignKey: "userId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Material.belongsTo(User, {
  foreignKey: "userId",
});

User.hasMany(RoleChangeRequest, {
  foreignKey: {
    name: "userId",
    field: "user_id",
  },
  as: "roleRequests",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

RoleChangeRequest.belongsTo(User, {
  foreignKey: {
    name: "userId",
    field: "user_id",
  },
  as: "requestUser",
});

RoleChangeRequest.belongsTo(User, {
  foreignKey: {
    name: "reviewedBy",
    field: "reviewed_by",
  },
  as: "reviewer",
});

TeacherStudentDialogue.belongsTo(User, {
  foreignKey: { name: "teacherId", field: "teacher_id" },
  as: "teacher",
});
TeacherStudentDialogue.belongsTo(User, {
  foreignKey: { name: "studentId", field: "student_id" },
  as: "student",
});

DialogueMessage.belongsTo(TeacherStudentDialogue, {
  foreignKey: { name: "dialogueId", field: "dialogue_id" },
  as: "dialogue",
});
TeacherStudentDialogue.hasMany(DialogueMessage, {
  foreignKey: { name: "dialogueId", field: "dialogue_id" },
  as: "messages",
});
DialogueMessage.belongsTo(User, {
  foreignKey: { name: "senderId", field: "sender_id" },
  as: "sender",
});

DialogueAttachment.belongsTo(DialogueMessage, {
  foreignKey: { name: "messageId", field: "message_id" },
  as: "message",
});
DialogueMessage.hasMany(DialogueAttachment, {
  foreignKey: { name: "messageId", field: "message_id" },
  as: "attachments",
});

AIFeedbackDraft.belongsTo(TeacherStudentDialogue, {
  foreignKey: { name: "dialogueId", field: "dialogue_id" },
  as: "dialogue",
});
AIFeedbackDraft.belongsTo(DialogueMessage, {
  foreignKey: { name: "messageId", field: "message_id" },
  as: "message",
});

StudentPersonalization.belongsTo(User, {
  foreignKey: { name: "teacherId", field: "teacher_id" },
  as: "teacher",
});
StudentPersonalization.belongsTo(User, {
  foreignKey: { name: "studentId", field: "student_id" },
  as: "student",
});

export {
  User,
  Material,
  RoleChangeRequest,
  TeacherStudentDialogue,
  DialogueMessage,
  DialogueAttachment,
  AIFeedbackDraft,
  StudentPersonalization,
};
