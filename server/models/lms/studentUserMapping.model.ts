import { DataTypes } from "sequelize";
import sequelize from "../../db.js";

const StudentUserMapping = sequelize.define(
  "StudentUserMapping",
  {
    student_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: "lms_students",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "student_user_mapping",
    timestamps: false,
  },
);

export default StudentUserMapping;
