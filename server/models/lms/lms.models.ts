import { DataTypes } from "sequelize";
import sequelize from "../../db.js";


const LMSStudent = sequelize.define(
	"LMSStudent",
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			allowNull: false,
		},
		full_name: {
			type: DataTypes.STRING(255),
			allowNull: false,
		},
		email: {
			type: DataTypes.STRING(255),
			allowNull: false,
			unique: true,
		},
		enrollment_year: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		created_at: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
		},
	},
	{
		tableName: "lms_students",
		timestamps: false,
	}
);

const LMSTeacher = sequelize.define(
	"LMSTeacher",
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		full_name: {
			type: DataTypes.STRING(255),
			allowNull: false,
		},
		email: {
			type: DataTypes.STRING(255),
			allowNull: false,
			unique: true,
		},
		created_at: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
		},
	},
	{
		tableName: "lms_teachers",
		timestamps: false,
	}
);

const LMSCourse = sequelize.define(
	"LMSCourse",
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		teacher_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: "lms_teachers",
				key: "id",
			},
			onDelete: "CASCADE",
		},
		title: {
			type: DataTypes.STRING(255),
			allowNull: false,
		},
		code: {
			type: DataTypes.STRING(50),
			allowNull: false,
			unique: true,
		},
		created_at: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
		},
	},
	{
		tableName: "lms_courses",
		timestamps: false,
	}
);

const LMSEnrollment = sequelize.define(
	"LMSEnrollment",
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		student_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: "lms_students",
				key: "id",
			},
			onDelete: "CASCADE",
		},
		course_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: "lms_courses",
				key: "id",
			},
			onDelete: "CASCADE",
		},
		enrolled_at: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
		},
	},
	{
		tableName: "lms_enrollments",
		timestamps: false,
		indexes: [
			{
				unique: true,
				fields: ["student_id", "course_id"],
			},
		],
	}
);

const LMSEvent = sequelize.define(
	"LMSEvent",
	{
		id: {
			type: DataTypes.BIGINT,
			primaryKey: true,
			autoIncrement: true,
		},
		student_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: "lms_students",
				key: "id",
			},
			onDelete: "CASCADE",
		},
		course_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: "lms_courses",
				key: "id",
			},
			onDelete: "CASCADE",
		},
		event_type: {
			type: DataTypes.STRING(64),
			allowNull: false,
		},
		event_score: {
			type: DataTypes.DECIMAL(5, 2),
			allowNull: true,
		},
		event_at: {
			type: DataTypes.DATE,
			allowNull: false,
		},
	},
	{
		tableName: "lms_events",
		timestamps: false,
	}
);

LMSTeacher.hasMany(LMSCourse, {
	foreignKey: "teacher_id",
	as: "courses",
	onDelete: "CASCADE",
	onUpdate: "CASCADE",
});

LMSCourse.belongsTo(LMSTeacher, {
	foreignKey: "teacher_id",
	as: "teacher",
});

LMSStudent.belongsToMany(LMSCourse, {
	through: LMSEnrollment,
	foreignKey: "student_id",
	otherKey: "course_id",
	as: "courses",
});

LMSCourse.belongsToMany(LMSStudent, {
	through: LMSEnrollment,
	foreignKey: "course_id",
	otherKey: "student_id",
	as: "students",
});

LMSStudent.hasMany(LMSEnrollment, {
	foreignKey: "student_id",
	as: "enrollments",
	onDelete: "CASCADE",
	onUpdate: "CASCADE",
});

LMSCourse.hasMany(LMSEnrollment, {
	foreignKey: "course_id",
	as: "enrollments",
	onDelete: "CASCADE",
	onUpdate: "CASCADE",
});

LMSEnrollment.belongsTo(LMSStudent, {
	foreignKey: "student_id",
	as: "student",
});

LMSEnrollment.belongsTo(LMSCourse, {
	foreignKey: "course_id",
	as: "course",
});

LMSStudent.hasMany(LMSEvent, {
	foreignKey: "student_id",
	as: "events",
	onDelete: "CASCADE",
	onUpdate: "CASCADE",
});

LMSCourse.hasMany(LMSEvent, {
	foreignKey: "course_id",
	as: "events",
	onDelete: "CASCADE",
	onUpdate: "CASCADE",
});

LMSEvent.belongsTo(LMSStudent, {
	foreignKey: "student_id",
	as: "student",
});

LMSEvent.belongsTo(LMSCourse, {
	foreignKey: "course_id",
	as: "course",
});

export {
	LMSStudent,
	LMSTeacher,
	LMSCourse,
	LMSEnrollment,
	LMSEvent,
};
