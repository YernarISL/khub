'use strict';

export default {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('ml_student_course_features', {
      student_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false, 
        references: {
          model: "lms_students",
          key: "id",
        },
        onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false, 
        references: {
          model: "users",
          key: "id"
        },
        onDelete: 'CASCADE',
      },
      course_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: "lms_courses",
          key: "id",
        },
        onDelete: 'CASCADE',
      },
      teacher_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "lms_teachers",
          key: "id",
        },
        onDelete: 'CASCADE',
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
        type: Sequelize.DECIMAL(5, 2)
      },
      score_trend: {
        type: Sequelize.DECIMAL(6, 4)
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
        type: Sequelize.DECIMAL(5, 4)
      },
      label_fault: {
        type: Sequelize.SMALLINT
      },
      refreshed_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      }
    },
    {
      tableName: "ml_student_course_features",
      timestamps: false,
    });
    
    await queryInterface.removeColumn('materials', 'aiSummary');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('ml_student_course_features');
    await queryInterface.addColumn('materials', 'aiSummary', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  }
};
