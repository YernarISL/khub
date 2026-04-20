'use strict';

export default {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS lms_students (
        id INTEGER PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        enrollment_year INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  },

  async down() {
    await queryInterface.sequelize.query(`
      DROP TABLE IF EXISTS lms_students;
    `); 
  },
};
