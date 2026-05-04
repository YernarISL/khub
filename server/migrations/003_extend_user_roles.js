export default {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'MANAGER';
      ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'TEACHER';
      ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'STUDENT';
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("users", "role", {
      type: Sequelize.ENUM("USER", "ADMIN"),
      allowNull: false,
      defaultValue: "USER",
    });
  },
};
