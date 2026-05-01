// Initial schema migration
export default {
  up: async (queryInterface, Sequelize) => {
    // Create users table
    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      secondName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM("USER", "ADMIN"),
        defaultValue: "USER",
      },
      profileImage: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });

    // Create materials table
    await queryInterface.createTable("materials", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      materialCategory: {
        type: Sequelize.ENUM("ARTICLE", "LR", "THESES", "BOOK", "DATA"),
        allowNull: true,
      },
      publishedDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      materialType: {
        type: Sequelize.ENUM("EDITOR", "UPLOAD"),
        allowNull: false,
      },
      content: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });

    // Create lms_students table
    await queryInterface.createTable("lms_students", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      full_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      enrollment_year: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });

    // Create lms_teachers table
    await queryInterface.createTable("lms_teachers", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      full_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });

    // Create lms_courses table
    await queryInterface.createTable("lms_courses", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      teacher_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "lms_teachers",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });

    // Create lms_enrollments table
    await queryInterface.createTable("lms_enrollments", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      student_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "lms_students",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      course_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "lms_courses",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      enrolled_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });

    // Add unique constraint on (student_id, course_id)
    await queryInterface.addConstraint("lms_enrollments", {
      fields: ["student_id", "course_id"],
      type: "unique",
    });

    // Create lms_events table
    await queryInterface.createTable("lms_events", {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      student_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "lms_students",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      course_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "lms_courses",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      event_type: {
        type: Sequelize.STRING(64),
        allowNull: false,
      },
      event_score: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      event_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Create ml_student_features table
    await queryInterface.createTable("ml_student_features", {
      student_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: "lms_students",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      enrollment_year: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      total_courses_enrolled: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      courses_completed: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      courses_abandoned: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      avg_score_overall: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      score_trend: {
        type: Sequelize.DECIMAL(6, 4),
        allowNull: true,
      },
      total_active_days: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      days_since_last_activity: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      avg_weekly_events: {
        type: Sequelize.DECIMAL(6, 2),
        allowNull: true,
      },
      avg_session_gap_days: {
        type: Sequelize.DECIMAL(6, 2),
        allowNull: true,
      },
      late_submission_rate: {
        type: Sequelize.DECIMAL(5, 4),
        allowNull: true,
      },
      label_at_fault: {
        type: Sequelize.SMALLINT,
        allowNull: true,
      },
      label_dropout: {
        type: Sequelize.SMALLINT,
        allowNull: true,
      },
      refreshed_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });

    // Create ml_student_course_features table
    await queryInterface.createTable("ml_student_course_features", {
      student_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: "lms_students",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      user_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      course_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: "lms_courses",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      teacher_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: "lms_teachers",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      completion_rate: {
        type: Sequelize.DECIMAL(5, 4),
        defaultValue: 0,
      },
      is_completed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      avg_score: {
        type: Sequelize.DECIMAL(5, 2),
      },
      score_trend: {
        type: Sequelize.DECIMAL(6, 4),
      },
      total_events: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      days_active_on_course: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      days_since_last_activity: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      submission_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      late_submission_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      engagement_score: {
        type: Sequelize.DECIMAL(5, 4),
      },
      label_fault: {
        type: Sequelize.SMALLINT,
      },
      refreshed_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables in reverse order (respect foreign keys)
    await queryInterface.dropTable("ml_student_course_features", {
      force: true,
    });
    await queryInterface.dropTable("ml_student_features", { force: true });
    await queryInterface.dropTable("lms_events", { force: true });
    await queryInterface.dropTable("lms_enrollments", { force: true });
    await queryInterface.dropTable("lms_courses", { force: true });
    await queryInterface.dropTable("lms_teachers", { force: true });
    await queryInterface.dropTable("lms_students", { force: true });
    await queryInterface.dropTable("materials", { force: true });
    await queryInterface.dropTable("users", { force: true });
  },
};
