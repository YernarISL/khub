'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS lms_teachers (
          id SERIAL PRIMARY KEY,
          full_name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS lms_courses (
        id SERIAL PRIMARY KEY,
        teacher_id INT NOT NULL REFERENCES lms_teachers(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        code VARCHAR(50) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS lms_enrollments (
        id SERIAL PRIMARY KEY,
        student_id INT NOT NULL REFERENCES lms_students(id) ON DELETE CASCADE,
        course_id INT NOT NULL REFERENCES lms_courses(id) ON DELETE CASCADE,
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (student_id, course_id)
      );

      CREATE TABLE IF NOT EXISTS lms_events (
          id BIGSERIAL PRIMARY KEY,
          student_id INT NOT NULL REFERENCES lms_students(id) ON DELETE CASCADE,
          course_id INT NOT NULL REFERENCES lms_courses(id) ON DELETE CASCADE,
          event_type VARCHAR(64) NOT NULL,
          event_score NUMERIC(5, 2),
          event_at TIMESTAMP NOT NULL
      );
    `);  
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP TABLE IF EXISTS lms_teachers;
      DROP TABLE IF EXISTS lms_courses;
      DROP TABLE IF EXISTS lms_enrollments;
      DROP TABLE IF EXISTS lms_events;
    `);
  }
};
