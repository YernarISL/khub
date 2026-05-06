export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("teacher_student_dialogues", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      teacher_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      student_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      last_message_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
    });
    await queryInterface.addConstraint("teacher_student_dialogues", {
      fields: ["teacher_id", "student_id"],
      type: "unique",
      name: "teacher_student_dialogues_teacher_student_key",
    });

    await queryInterface.createTable("dialogue_messages", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      dialogue_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "teacher_student_dialogues", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      sender_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      sender_role: {
        type: Sequelize.ENUM("TEACHER", "STUDENT", "AI"),
        allowNull: false,
      },
      source: {
        type: Sequelize.ENUM("MANUAL", "AI_DRAFT"),
        allowNull: false,
        defaultValue: "MANUAL",
      },
      status: {
        type: Sequelize.ENUM("draft_ai", "draft_teacher", "ready_for_review", "approved_sent", "rejected"),
        allowNull: false,
        defaultValue: "approved_sent",
      },
      body: { type: Sequelize.TEXT, allowNull: false },
      grade_0_10: { type: Sequelize.DECIMAL(4, 2), allowNull: true },
      sent_by_teacher: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
    });
    await queryInterface.addIndex("dialogue_messages", ["dialogue_id", "created_at"]);
    await queryInterface.addIndex("dialogue_messages", ["sender_id", "created_at"]);

    await queryInterface.createTable("dialogue_attachments", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      message_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "dialogue_messages", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      original_name: { type: Sequelize.STRING, allowNull: false },
      mime_type: { type: Sequelize.STRING, allowNull: false },
      size_bytes: { type: Sequelize.INTEGER, allowNull: false },
      parse_status: {
        type: Sequelize.ENUM("pending", "parsed", "failed"),
        allowNull: false,
        defaultValue: "pending",
      },
      extracted_text: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
    });

    await queryInterface.createTable("ai_feedback_drafts", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      dialogue_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "teacher_student_dialogues", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      message_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "dialogue_messages", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      generated_by_teacher_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      status: {
        type: Sequelize.ENUM("ready_for_review", "approved_sent", "rejected", "failed"),
        allowNull: false,
        defaultValue: "ready_for_review",
      },
      feedback_text: { type: Sequelize.TEXT, allowNull: true },
      grade_0_10: { type: Sequelize.DECIMAL(4, 2), allowNull: true },
      confidence: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
      key_points: { type: Sequelize.JSONB, allowNull: true },
      prompt_snapshot: { type: Sequelize.TEXT, allowNull: true },
      model_name: { type: Sequelize.STRING, allowNull: true },
      refusal_reason: { type: Sequelize.TEXT, allowNull: true },
      error_reason: { type: Sequelize.TEXT, allowNull: true },
      latency_ms: { type: Sequelize.INTEGER, allowNull: true },
      token_usage: { type: Sequelize.INTEGER, allowNull: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
    });
    await queryInterface.addIndex("ai_feedback_drafts", ["dialogue_id", "created_at"]);
    await queryInterface.addIndex("ai_feedback_drafts", ["generated_by_teacher_id", "created_at"]);

    await queryInterface.createTable("student_personalizations", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      teacher_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      student_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      note: { type: Sequelize.TEXT, allowNull: false },
      updated_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
    });
    await queryInterface.addConstraint("student_personalizations", {
      fields: ["teacher_id", "student_id"],
      type: "unique",
      name: "student_personalizations_teacher_student_key",
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("student_personalizations");
    await queryInterface.dropTable("ai_feedback_drafts");
    await queryInterface.dropTable("dialogue_attachments");
    await queryInterface.dropTable("dialogue_messages");
    await queryInterface.dropTable("teacher_student_dialogues");
  },
};
