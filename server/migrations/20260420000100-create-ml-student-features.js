'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ml_student_features', {
      student_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'lms_students',
          key: 'id',
        },
        onDelete: 'CASCADE',
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
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('ml_student_features');
  },
};
