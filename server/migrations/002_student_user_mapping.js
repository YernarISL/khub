// Bridge LMS students to platform users; ML feature tables keyed by student_id only
export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("student_user_mapping", {
      student_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: "lms_students",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });

    await queryInterface.removeColumn("ml_student_features", "user_id");

    await queryInterface.removeConstraint(
      "ml_student_course_features",
      "ml_student_course_features_pkey",
    );
    await queryInterface.removeColumn("ml_student_course_features", "user_id");
    await queryInterface.addConstraint("ml_student_course_features", {
      fields: ["student_id", "course_id", "teacher_id"],
      type: "primary key",
      name: "ml_student_course_features_pkey",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("ml_student_features", "user_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    });
    await queryInterface.sequelize.query(`
      UPDATE ml_student_features AS msf
      SET user_id = m.user_id
      FROM student_user_mapping AS m
      WHERE msf.student_id = m.student_id
    `);
    await queryInterface.sequelize.query(`
      UPDATE ml_student_features
      SET user_id = (SELECT id FROM users ORDER BY id LIMIT 1)
      WHERE user_id IS NULL
    `);
    await queryInterface.changeColumn("ml_student_features", "user_id", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    });

    await queryInterface.removeConstraint(
      "ml_student_course_features",
      "ml_student_course_features_pkey",
    );
    await queryInterface.addColumn("ml_student_course_features", "user_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    });
    await queryInterface.sequelize.query(`
      UPDATE ml_student_course_features AS mscf
      SET user_id = m.user_id
      FROM student_user_mapping AS m
      WHERE mscf.student_id = m.student_id
    `);
    await queryInterface.sequelize.query(`
      UPDATE ml_student_course_features
      SET user_id = (SELECT id FROM users ORDER BY id LIMIT 1)
      WHERE user_id IS NULL
    `);
    await queryInterface.changeColumn("ml_student_course_features", "user_id", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    });
    await queryInterface.addConstraint("ml_student_course_features", {
      fields: ["student_id", "user_id", "course_id", "teacher_id"],
      type: "primary key",
      name: "ml_student_course_features_pkey",
    });

    await queryInterface.dropTable("student_user_mapping");
  },
};
