import { Client } from 'pg';
import { faker } from '@faker-js/faker';

const client = new Client({
    user: 'user',
    host: 'localhost',
    port: 5432,
    database: 'mydb',
    password: 'password'
});

faker.seed(20260501);

const insertBatch = async (query: string, values: unknown[][]) => {
    if (values.length === 0) {
        return;
    }

    const params: unknown[] = [];
    const placeholders = values
        .map((row, rowIndex) => {
            const rowPlaceholders = row
                .map((_, colIndex) => {
                    const paramIndex = rowIndex * row.length + colIndex + 1;
                    return `$${paramIndex}`;
                })
                .join(', ');

            params.push(...row);
            return `(${rowPlaceholders})`;
        })
        .join(', ');

    await client.query(`${query} ${placeholders}`, params);
};

type StudentProfile = {
    ability: number;
    engagement: number;
    discipline: number;
    externalLoad: number;
};

type CourseProfile = {
    difficulty: number;
    strictness: number;
    expectedDurationDays: number;
};

type EnrollmentProfile = {
    dropout: boolean;
    dropoutProgress: number;
    expectedDurationDays: number;
};

const STUDENT_PROFILES = new Map<number, StudentProfile>();
const COURSE_PROFILES = new Map<number, CourseProfile>();
const ENROLLMENT_PROFILES = new Map<string, EnrollmentProfile>();

const enrollmentKey = (studentId: number, courseId: number) => `${studentId}:${courseId}`;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const randomProfileValue = (min: number, max: number) => faker.number.float({ min, max, fractionDigits: 4 });

const getWeekBucket = (date: Date) => {
    const yearStart = Date.UTC(date.getUTCFullYear(), 0, 1);
    const current = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    const dayOfYear = Math.floor((current - yearStart) / (24 * 60 * 60 * 1000)) + 1;
    return `${date.getUTCFullYear()}-${Math.ceil(dayOfYear / 7)}`;
};

const getStudentProfile = (studentId: number): StudentProfile => {
    let profile = STUDENT_PROFILES.get(studentId);
    if (!profile) {
        profile = {
            ability: randomProfileValue(0.2, 1),
            engagement: randomProfileValue(0.15, 1),
            discipline: randomProfileValue(0.15, 1),
            externalLoad: randomProfileValue(0, 1),
        };
        STUDENT_PROFILES.set(studentId, profile);
    }
    return profile;
};

const getCourseProfile = (courseId: number): CourseProfile => {
    let profile = COURSE_PROFILES.get(courseId);
    if (!profile) {
        profile = {
            difficulty: randomProfileValue(0.2, 1),
            strictness: randomProfileValue(0.1, 1),
            expectedDurationDays: faker.number.int({ min: 84, max: 140 }),
        };
        COURSE_PROFILES.set(courseId, profile);
    }
    return profile;
};

const seedStudentsData = async () => {
    const students: [string, string, number][] = [];

    for (let i = 0; i < 2000; i++) {
        students.push([
            faker.person.fullName(),
            faker.internet.email().toLocaleLowerCase(),
            faker.number.int({ min: 2022, max: 2026 }),
        ]);
    }

    const batchSize = 500;
    for (let i = 0; i < students.length; i += batchSize) {
        const batch = students.slice(i, i + batchSize);
        await insertBatch(
            'INSERT INTO lms_students (full_name, email, enrollment_year) VALUES',
            batch
        );
    }
};

const seedTeachersData = async () => {
    const teachers: [string, string][] = [];

    for (let i = 0; i < 100; i++) {
        teachers.push([
            faker.person.fullName(),
            faker.internet.email().toLocaleLowerCase(),
        ]);
    }

    const batchSize = 200;
    for (let i = 0; i < teachers.length; i += batchSize) {
        const batch = teachers.slice(i, i + batchSize);
        await insertBatch(
            'INSERT INTO lms_teachers (full_name, email) VALUES',
            batch
        );
    }
};

type CourseTemplate = {
    title: string;
    code: string;
};

const courseTemplates: CourseTemplate[] = [
    { title: 'Математический анализ I', code: 'MATH-101' },
    { title: 'Математический анализ II', code: 'MATH-102' },
    { title: 'Математический анализ III', code: 'MATH-201' },
    { title: 'Линейная алгебра и аналитическая геометрия', code: 'MATH-110' },
    { title: 'Общая физика: Механика', code: 'PHYS-101' },
    { title: 'Общая физика: Термодинамика', code: 'PHYS-102' },
    { title: 'Общая физика: Электричество', code: 'PHYS-103' },
    { title: 'Общая физика: Оптика', code: 'PHYS-104' },
    { title: 'Химия (общая)', code: 'CHEM-101' },
    { title: 'Химия (прикладная)', code: 'CHEM-201' },
    { title: 'Теория вероятностей и математическая статистика', code: 'MATH-220' },
    { title: 'Инженерная и компьютерная графика (AutoCAD/Compass)', code: 'ENG-201' },
    { title: 'Инженерное 3D-моделирование (SolidWorks)', code: 'ENG-202' },
    { title: 'Теоретическая механика', code: 'ENG-210' },
    { title: 'Сопротивление материалов', code: 'ENG-220' },
    { title: 'ИКТ и основы алгоритмизации (Python)', code: 'CS-150' },
    { title: 'Электротехника и основы электроники', code: 'ENG-230' },
    { title: 'Материаловедение и технология конструкционных материалов', code: 'ENG-240' },
    { title: 'Структуры данных и алгоритмы', code: 'CS-210' },
    { title: 'Базы данных (SQL)', code: 'CS-220' },
    { title: 'Архитектура компьютерных систем', code: 'CS-230' },
    { title: 'Сетевые технологии', code: 'CS-240' },
    { title: 'Строительная механика', code: 'CIV-210' },
    { title: 'Железобетонные и каменные конструкции', code: 'CIV-220' },
    { title: 'Основания и фундаменты', code: 'CIV-230' },
    { title: 'Теория механизмов и машин (ТММ)', code: 'MECH-210' },
    { title: 'Детали машин', code: 'MECH-220' },
    { title: 'Метрология и стандартизация', code: 'MECH-230' },
    { title: 'Термодинамика в энергетике', code: 'ENER-210' },
    { title: 'Релейная защита', code: 'ENER-220' },
    { title: 'Электрические сети и системы', code: 'ENER-230' },
    { title: 'История Казахстана', code: 'SOC-101' },
    { title: 'Философия', code: 'SOC-102' },
    { title: 'Казахский язык (профессиональный)', code: 'LANG-101' },
    { title: 'Русский язык (профессиональный)', code: 'LANG-102' },
    { title: 'Английский язык (профессиональный)', code: 'LANG-103' },
    { title: 'Экология и безопасность жизнедеятельности', code: 'SOC-201' },
];

const seedCoursesData = async () => {
    const teacherRows = await client.query<{ id: number }>('SELECT id FROM lms_teachers ORDER BY id');
    const teacherIds = teacherRows.rows.map((row) => row.id);

    if (teacherIds.length === 0) {
        throw new Error('Teachers are required before seeding courses.');
    }

    const usedTeacherCounts = new Map<number, number>();
    const courses: [number, string, string][] = courseTemplates.map((course) => {
        const sortedTeacherIds = [...teacherIds].sort((a, b) => {
            const aCount = usedTeacherCounts.get(a) ?? 0;
            const bCount = usedTeacherCounts.get(b) ?? 0;
            return aCount - bCount;
        });

        const selectedTeacherId = faker.helpers.arrayElement(sortedTeacherIds.slice(0, 10));
        usedTeacherCounts.set(selectedTeacherId, (usedTeacherCounts.get(selectedTeacherId) ?? 0) + 1);

        return [selectedTeacherId, course.title, course.code];
    });

    await insertBatch(
        'INSERT INTO lms_courses (teacher_id, title, code) VALUES',
        courses
    );

    const courseRows = await client.query<{ id: number }>('SELECT id FROM lms_courses ORDER BY id');
    for (const row of courseRows.rows) {
        getCourseProfile(row.id);
    }
};

const getCourseLoadRangeByYear = (enrollmentYear: number) => {
    if (enrollmentYear <= 2022) {
        return { min: 7, max: 10 };
    }

    if (enrollmentYear === 2023) {
        return { min: 6, max: 9 };
    }

    if (enrollmentYear === 2024) {
        return { min: 5, max: 8 };
    }

    if (enrollmentYear === 2025) {
        return { min: 4, max: 7 };
    }

    return { min: 3, max: 6 };
};

const getDropoutProbability = (student: StudentProfile, course: CourseProfile, enrollmentYear: number) => {
    const recencyPenalty = clamp((enrollmentYear - 2022) * 0.025, 0, 0.1);
    const risk =
        0.26
        - 0.2 * student.engagement
        - 0.16 * student.discipline
        - 0.14 * student.ability
        + 0.2 * student.externalLoad
        + 0.22 * course.difficulty
        + 0.08 * course.strictness
        + recencyPenalty;
    return clamp(risk, 0.08, 0.33);
};

const sampleDropout = (student: StudentProfile, course: CourseProfile, enrollmentYear: number) => {
    const p = getDropoutProbability(student, course, enrollmentYear);
    return faker.number.float({ min: 0, max: 1, fractionDigits: 4 }) < p;
};

const seedEnrollmentsData = async () => {
    const studentsRows = await client.query<{ id: number; enrollment_year: number }>(
        'SELECT id, enrollment_year FROM lms_students ORDER BY id'
    );
    const coursesRows = await client.query<{ id: number }>('SELECT id FROM lms_courses ORDER BY id');

    const courseIds = coursesRows.rows.map((row) => row.id);
    if (courseIds.length === 0) {
        throw new Error('Courses are required before seeding enrollments.');
    }

    const enrollments: [number, number, Date][] = [];

    for (const student of studentsRows.rows) {
        const studentProfile = getStudentProfile(student.id);
        const { min, max } = getCourseLoadRangeByYear(student.enrollment_year);
        const adjustedMin = clamp(Math.round(min + (studentProfile.ability - 0.5) * 2), 2, max);
        const adjustedMax = clamp(Math.round(max + (studentProfile.engagement - 0.5) * 2), adjustedMin, courseIds.length);
        const desiredCourses = faker.number.int({
            min: adjustedMin,
            max: Math.min(adjustedMax, courseIds.length),
        });

        const selectedCourses = faker.helpers.arrayElements(courseIds, desiredCourses);
        const startDate = new Date(student.enrollment_year, 7, 20);
        const now = new Date();
        const enrollmentFrom = startDate <= now
            ? startDate
            : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        for (const courseId of selectedCourses) {
            const courseProfile = getCourseProfile(courseId);
            const isDropout = sampleDropout(studentProfile, courseProfile, student.enrollment_year);
            ENROLLMENT_PROFILES.set(enrollmentKey(student.id, courseId), {
                dropout: isDropout,
                dropoutProgress: isDropout ? faker.number.float({ min: 0.2, max: 0.65, fractionDigits: 4 }) : 1,
                expectedDurationDays: courseProfile.expectedDurationDays,
            });
            const enrolledAt = faker.date.between({ from: enrollmentFrom, to: now });
            enrollments.push([student.id, courseId, enrolledAt]);
        }
    }

    const batchSize = 1500;
    for (let i = 0; i < enrollments.length; i += batchSize) {
        const batch = enrollments.slice(i, i + batchSize);
        await insertBatch(
            'INSERT INTO lms_enrollments (student_id, course_id, enrolled_at) VALUES',
            batch
        );
    }
};

const scoredEventTypes = [
    'assignment_submit',
    'quiz_attempt',
    'lab_work',
    'midterm_exam',
    'final_exam',
] as const;

const getEventCountByEnrollmentYear = (enrollmentYear: number) => {
    if (enrollmentYear <= 2022) {
        return faker.number.int({ min: 50, max: 100 });
    }

    if (enrollmentYear === 2023) {
        return faker.number.int({ min: 40, max: 85 });
    }

    if (enrollmentYear === 2024) {
        return faker.number.int({ min: 28, max: 70 });
    }

    if (enrollmentYear === 2025) {
        return faker.number.int({ min: 18, max: 50 });
    }

    return faker.number.int({ min: 12, max: 32 });
};

const generateScoreByEventType = (
    eventType: string,
    student: StudentProfile,
    course: CourseProfile,
    progress: number,
    dropout: boolean
) => {
    const eventDifficultyShift = eventType === 'final_exam' ? 0.12 : eventType === 'midterm_exam' ? 0.08 : 0.04;
    const base = 50 + student.ability * 32 + student.discipline * 8 - course.difficulty * 18 - course.strictness * 6;
    const progressionBonus = progress * 7;
    const dropoutPenalty = dropout ? 14 * clamp(progress, 0.35, 1) : 0;
    const noise = faker.number.float({ min: -14, max: 14, fractionDigits: 2 });
    const raw = base + progressionBonus - eventDifficultyShift * 30 - dropoutPenalty + noise;
    return clamp(Math.round(raw * 100) / 100, 25, 100);
};

const pickEventType = (progress: number, student: StudentProfile, dropout: boolean) => {
    const lowEngagementBoost = clamp((0.45 - student.engagement) * 8, 0, 3);
    if (dropout && progress > 0.3) {
        return faker.helpers.weightedArrayElement([
            { value: 'login', weight: 6 + lowEngagementBoost },
            { value: 'material_view', weight: 4 },
            { value: 'lecture_attendance', weight: 3 },
            { value: 'practice_session', weight: 1 },
            { value: 'quiz_attempt', weight: 1 },
        ]);
    }

    if (progress < 0.3) {
        return faker.helpers.weightedArrayElement([
            { value: 'login', weight: 5 + lowEngagementBoost },
            { value: 'material_view', weight: 4 },
            { value: 'lecture_attendance', weight: 3 },
            { value: 'practice_session', weight: 2 },
            { value: 'quiz_attempt', weight: 1 },
        ]);
    }

    if (progress < 0.8) {
        return faker.helpers.weightedArrayElement([
            { value: 'material_view', weight: 4 },
            { value: 'practice_session', weight: 3 },
            { value: 'assignment_submit', weight: 3 },
            { value: 'quiz_attempt', weight: 2 },
            { value: 'lab_work', weight: 2 },
            { value: 'forum_post', weight: 1 },
        ]);
    }

    return faker.helpers.weightedArrayElement([
        { value: 'assignment_submit', weight: 3 },
        { value: 'quiz_attempt', weight: 2 },
        { value: 'lab_work', weight: 2 },
        { value: 'midterm_exam', weight: 1 },
        { value: 'final_exam', weight: 1 },
    ]);
};

const seedEventsData = async () => {
    const enrollmentsRows = await client.query<{
        student_id: number;
        course_id: number;
        enrolled_at: Date;
        enrollment_year: number;
    }>(
        `SELECT e.student_id, e.course_id, e.enrolled_at, s.enrollment_year
         FROM lms_enrollments e
         INNER JOIN lms_students s ON s.id = e.student_id`
    );

    const eventsBuffer: [number, number, string, number | null, Date][] = [];
    const insertBufferSize = 4000;
    const now = new Date();

    for (const enrollment of enrollmentsRows.rows) {
        const studentProfile = getStudentProfile(enrollment.student_id);
        const courseProfile = getCourseProfile(enrollment.course_id);
        const profile = ENROLLMENT_PROFILES.get(enrollmentKey(enrollment.student_id, enrollment.course_id)) ?? {
            dropout: false,
            dropoutProgress: 1,
            expectedDurationDays: courseProfile.expectedDurationDays,
        };

        const baseEventCount = getEventCountByEnrollmentYear(enrollment.enrollment_year);
        const activityMultiplier = clamp(
            0.55 + studentProfile.engagement * 0.8 + studentProfile.discipline * 0.25 - studentProfile.externalLoad * 0.35 - courseProfile.difficulty * 0.2,
            0.35,
            1.45
        );
        const eventCount = Math.max(8, Math.round(baseEventCount * activityMultiplier * (profile.dropout ? 0.72 : 1)));
        const plannedDuration = profile.expectedDurationDays;
        const timelineProgress = profile.dropout ? profile.dropoutProgress : 1;
        const activeDurationDays = Math.max(14, Math.round(plannedDuration * timelineProgress));

        let currentTimestamp = new Date(enrollment.enrolled_at);
        const timelineEnd = new Date(new Date(enrollment.enrolled_at).getTime() + activeDurationDays * 24 * 60 * 60 * 1000);
        const hardLimit = timelineEnd < now ? timelineEnd : now;

        for (let i = 0; i < eventCount; i++) {
            const progress = i / Math.max(eventCount - 1, 1);
            const eventType = pickEventType(progress, studentProfile, profile.dropout);

            const dayGap = faker.number.int({
                min: 0,
                max: Math.max(1, Math.round(4 + courseProfile.difficulty * 2 + (1 - studentProfile.discipline) * 3 + studentProfile.externalLoad * 2)),
            });
            const hourGap = faker.number.int({ min: 3, max: 24 });
            currentTimestamp = new Date(currentTimestamp.getTime() + dayGap * 24 * 60 * 60 * 1000 + hourGap * 60 * 60 * 1000);

            if (currentTimestamp > hardLimit) {
                currentTimestamp = hardLimit;
            }

            const isScored = scoredEventTypes.includes(eventType as (typeof scoredEventTypes)[number]);
            const eventScore = isScored ? generateScoreByEventType(eventType, studentProfile, courseProfile, progress, profile.dropout) : null;

            eventsBuffer.push([
                enrollment.student_id,
                enrollment.course_id,
                eventType,
                eventScore,
                currentTimestamp,
            ]);

            if (eventsBuffer.length >= insertBufferSize) {
                await insertBatch(
                    'INSERT INTO lms_events (student_id, course_id, event_type, event_score, event_at) VALUES',
                    eventsBuffer
                );
                eventsBuffer.length = 0;
            }
        }
    }

    if (eventsBuffer.length > 0) {
        await insertBatch(
            'INSERT INTO lms_events (student_id, course_id, event_type, event_score, event_at) VALUES',
            eventsBuffer
        );
    }
};

const seedMLStudentFeatureData = async () => {
    const usersRows = await client.query<{ id: number }>('SELECT id FROM users ORDER BY id');
    if (usersRows.rows.length === 0) {
        throw new Error('Users are required before seeding ml features.');
    }
    const userIds = usersRows.rows.map((row) => row.id);

    const enrollmentsRows = await client.query<{
        student_id: number;
        course_id: number;
        teacher_id: number;
        enrollment_year: number;
        enrolled_at: Date;
    }>(
        `SELECT e.student_id, e.course_id, c.teacher_id, s.enrollment_year, e.enrolled_at
         FROM lms_enrollments e
         INNER JOIN lms_students s ON s.id = e.student_id
         INNER JOIN lms_courses c ON c.id = e.course_id`
    );

    const eventsRows = await client.query<{
        student_id: number;
        course_id: number;
        event_type: string;
        event_score: number | null;
        event_at: Date;
    }>(
        `SELECT student_id, course_id, event_type, event_score, event_at
         FROM lms_events
         ORDER BY student_id, course_id, event_at`
    );

    type EventRow = {
        event_type: string;
        event_score: number | null;
        event_at: Date;
    };

    type EnrollmentAgg = {
        enrollmentYear: number;
        teacherId: number;
        userId: number;
        enrolledAt: Date;
        cutoffAt: Date;
        allEvents: EventRow[];
        eventsCutoff: EventRow[];
        scoredCutoff: number[];
        scoredAll: number[];
        droppedOut: boolean;
        completed: boolean;
        completionRate: number;
        avgScore: number | null;
        scoreTrend: number | null;
        daysActiveOnCourse: number;
        daysSinceLastActivity: number;
        submissionCount: number;
        lateSubmissionCount: number;
        engagementScore: number;
        labelFault: number;
    };

    const eventsByEnrollment = new Map<string, EventRow[]>();
    for (const row of eventsRows.rows) {
        const key = enrollmentKey(row.student_id, row.course_id);
        const list = eventsByEnrollment.get(key) ?? [];
        list.push({
            event_type: row.event_type,
            event_score: row.event_score,
            event_at: row.event_at,
        });
        eventsByEnrollment.set(key, list);
    }

    const courseFeatureRows: unknown[][] = [];
    const studentAggById = new Map<number, {
        userId: number;
        enrollmentYear: number;
        totalCourses: number;
        completedCourses: number;
        abandonedCourses: number;
        allScores: number[];
        scoreTrends: number[];
        activeDays: Set<string>;
        eventWeeks: Set<string>;
        eventCountCutoff: number;
        sessionGaps: number[];
        submissionCount: number;
        lateSubmissionCount: number;
        dropoutLabels: number[];
        faultLabels: number[];
        latestActivityAt: Date | null;
    }>();

    const now = new Date();
    const cutoffDays = 42;

    for (const enrollment of enrollmentsRows.rows) {
        const key = enrollmentKey(enrollment.student_id, enrollment.course_id);
        const events = eventsByEnrollment.get(key) ?? [];
        const sortedEvents = [...events].sort((a, b) => a.event_at.getTime() - b.event_at.getTime());
        const cutoffAt = new Date(new Date(enrollment.enrolled_at).getTime() + cutoffDays * 24 * 60 * 60 * 1000);
        const eventsCutoff = sortedEvents.filter((event) => event.event_at <= cutoffAt);
        const scoresCutoff = eventsCutoff.filter((event) => event.event_score !== null).map((event) => Number(event.event_score));
        const scoresAll = sortedEvents.filter((event) => event.event_score !== null).map((event) => Number(event.event_score));
        const lastEventAt = sortedEvents.at(-1)?.event_at ?? enrollment.enrolled_at;
        const enrollmentProfile = ENROLLMENT_PROFILES.get(key);
        const droppedOut = enrollmentProfile?.dropout ?? false;
        const completed = !droppedOut;
        const expectedDurationDays = enrollmentProfile?.expectedDurationDays ?? 120;
        const completionRate = clamp(
            (lastEventAt.getTime() - enrollment.enrolled_at.getTime()) / (expectedDurationDays * 24 * 60 * 60 * 1000),
            0,
            1
        );

        let scoreTrend: number | null = null;
        if (scoresCutoff.length >= 6) {
            const middle = Math.floor(scoresCutoff.length / 2);
            const firstHalf = scoresCutoff.slice(0, middle);
            const secondHalf = scoresCutoff.slice(middle);
            const firstAvg = firstHalf.reduce((acc, value) => acc + value, 0) / firstHalf.length;
            const secondAvg = secondHalf.reduce((acc, value) => acc + value, 0) / secondHalf.length;
            scoreTrend = Number(((secondAvg - firstAvg) / 100).toFixed(4));
        }

        const activeDays = new Set(eventsCutoff.map((event) => event.event_at.toISOString().slice(0, 10)));
        const daysSinceLastActivity = Math.max(0, Math.floor((now.getTime() - lastEventAt.getTime()) / (24 * 60 * 60 * 1000)));
        const submissionEvents = eventsCutoff.filter(
            (event) => event.event_type === 'assignment_submit' || event.event_type === 'lab_work'
        );

        let lateSubmissionCount = 0;
        for (let i = 1; i < submissionEvents.length; i++) {
            const current = submissionEvents[i];
            const previous = submissionEvents[i - 1];
            if (!current || !previous) {
                continue;
            }
            const gapDays = (current.event_at.getTime() - previous.event_at.getTime()) / (24 * 60 * 60 * 1000);
            if (gapDays > 10) {
                lateSubmissionCount += 1;
            }
        }

        const engagementScore = clamp(
            (eventsCutoff.length / cutoffDays) * 0.45
            + (activeDays.size / cutoffDays) * 0.25
            + (scoresCutoff.length > 0 ? (scoresCutoff.reduce((a, b) => a + b, 0) / scoresCutoff.length) / 100 : 0.5) * 0.3,
            0,
            1
        );

        const avgScoreAll = scoresAll.length > 0 ? scoresAll.reduce((a, b) => a + b, 0) / scoresAll.length : null;
        const labelFault = avgScoreAll !== null && avgScoreAll < 60 ? 1 : 0;

        const mappedUserId = userIds[(enrollment.student_id - 1) % userIds.length] ?? userIds[0]!;

        const enrollmentAgg: EnrollmentAgg = {
            enrollmentYear: enrollment.enrollment_year,
            teacherId: enrollment.teacher_id,
            userId: mappedUserId,
            enrolledAt: enrollment.enrolled_at,
            cutoffAt,
            allEvents: sortedEvents,
            eventsCutoff,
            scoredCutoff: scoresCutoff,
            scoredAll: scoresAll,
            droppedOut,
            completed,
            completionRate,
            avgScore: avgScoreAll !== null ? Number(avgScoreAll.toFixed(2)) : null,
            scoreTrend,
            daysActiveOnCourse: activeDays.size,
            daysSinceLastActivity,
            submissionCount: submissionEvents.length,
            lateSubmissionCount,
            engagementScore: Number(engagementScore.toFixed(4)),
            labelFault,
        };

        courseFeatureRows.push([
            enrollment.student_id,
            enrollmentAgg.userId,
            enrollment.course_id,
            enrollment.teacher_id,
            Number(enrollmentAgg.completionRate.toFixed(4)),
            enrollmentAgg.completed,
            enrollmentAgg.avgScore,
            enrollmentAgg.scoreTrend,
            enrollmentAgg.eventsCutoff.length,
            enrollmentAgg.daysActiveOnCourse,
            enrollmentAgg.daysSinceLastActivity,
            enrollmentAgg.submissionCount,
            enrollmentAgg.lateSubmissionCount,
            enrollmentAgg.engagementScore,
            enrollmentAgg.labelFault,
            now,
        ]);

        const studentAgg = studentAggById.get(enrollment.student_id) ?? {
            userId: enrollmentAgg.userId,
            enrollmentYear: enrollment.enrollment_year,
            totalCourses: 0,
            completedCourses: 0,
            abandonedCourses: 0,
            allScores: [],
            scoreTrends: [],
            activeDays: new Set<string>(),
            eventWeeks: new Set<string>(),
            eventCountCutoff: 0,
            sessionGaps: [],
            submissionCount: 0,
            lateSubmissionCount: 0,
            dropoutLabels: [],
            faultLabels: [],
            latestActivityAt: null,
        };

        studentAgg.totalCourses += 1;
        studentAgg.completedCourses += enrollmentAgg.completed ? 1 : 0;
        studentAgg.abandonedCourses += enrollmentAgg.droppedOut ? 1 : 0;
        studentAgg.allScores.push(...enrollmentAgg.scoredCutoff);
        if (enrollmentAgg.scoreTrend !== null) {
            studentAgg.scoreTrends.push(enrollmentAgg.scoreTrend);
        }
        studentAgg.eventCountCutoff += enrollmentAgg.eventsCutoff.length;
        studentAgg.submissionCount += enrollmentAgg.submissionCount;
        studentAgg.lateSubmissionCount += enrollmentAgg.lateSubmissionCount;
        studentAgg.dropoutLabels.push(enrollmentAgg.droppedOut ? 1 : 0);
        studentAgg.faultLabels.push(enrollmentAgg.labelFault);

        for (const event of enrollmentAgg.eventsCutoff) {
            studentAgg.activeDays.add(event.event_at.toISOString().slice(0, 10));
            studentAgg.eventWeeks.add(getWeekBucket(event.event_at));
        }

        const sortedCutoffEvents = enrollmentAgg.eventsCutoff;
        for (let i = 1; i < sortedCutoffEvents.length; i++) {
            const current = sortedCutoffEvents[i];
            const previous = sortedCutoffEvents[i - 1];
            if (!current || !previous) {
                continue;
            }
            const gapDays = (current.event_at.getTime() - previous.event_at.getTime()) / (24 * 60 * 60 * 1000);
            studentAgg.sessionGaps.push(gapDays);
        }

        if (!studentAgg.latestActivityAt || lastEventAt > studentAgg.latestActivityAt) {
            studentAgg.latestActivityAt = lastEventAt;
        }

        studentAggById.set(enrollment.student_id, studentAgg);
    }

    const studentFeatureRows: unknown[][] = [];
    for (const [studentId, agg] of studentAggById) {
        const avgScoreOverall = agg.allScores.length > 0
            ? Number((agg.allScores.reduce((a, b) => a + b, 0) / agg.allScores.length).toFixed(2))
            : null;
        const scoreTrend = agg.scoreTrends.length > 0
            ? Number((agg.scoreTrends.reduce((a, b) => a + b, 0) / agg.scoreTrends.length).toFixed(4))
            : null;
        const avgWeeklyEvents = agg.eventWeeks.size > 0
            ? Number((agg.eventCountCutoff / agg.eventWeeks.size).toFixed(2))
            : null;
        const avgSessionGap = agg.sessionGaps.length > 0
            ? Number((agg.sessionGaps.reduce((a, b) => a + b, 0) / agg.sessionGaps.length).toFixed(2))
            : null;
        const lateSubmissionRate = agg.submissionCount > 0
            ? Number((agg.lateSubmissionCount / agg.submissionCount).toFixed(4))
            : null;
        const daysSinceLastActivity = agg.latestActivityAt
            ? Math.max(0, Math.floor((now.getTime() - agg.latestActivityAt.getTime()) / (24 * 60 * 60 * 1000)))
            : null;

        const labelDropout = agg.totalCourses > 0 && agg.abandonedCourses / agg.totalCourses >= 0.3 ? 1 : 0;
        const failRatio = agg.faultLabels.length > 0
            ? agg.faultLabels.reduce((a, b) => a + b, 0) / agg.faultLabels.length
            : 0;
        const labelAtFault = avgScoreOverall !== null && (avgScoreOverall < 62 || failRatio > 0.4) ? 1 : 0;

        studentFeatureRows.push([
            studentId,
            agg.userId,
            agg.enrollmentYear,
            agg.totalCourses,
            agg.completedCourses,
            agg.abandonedCourses,
            avgScoreOverall,
            scoreTrend,
            agg.activeDays.size,
            daysSinceLastActivity,
            avgWeeklyEvents,
            avgSessionGap,
            lateSubmissionRate,
            labelAtFault,
            labelDropout,
            now,
        ]);
    }

    const courseBatchSize = 500;
    for (let i = 0; i < courseFeatureRows.length; i += courseBatchSize) {
        await insertBatch(
            `INSERT INTO ml_student_course_features (
                student_id, user_id, course_id, teacher_id, completion_rate, is_completed, avg_score,
                score_trend, total_events, days_active_on_course, days_since_last_activity,
                submission_count, late_submission_count, engagement_score, label_fault, refreshed_at
            ) VALUES`,
            courseFeatureRows.slice(i, i + courseBatchSize)
        );
    }

    const studentBatchSize = 500;
    for (let i = 0; i < studentFeatureRows.length; i += studentBatchSize) {
        await insertBatch(
            `INSERT INTO ml_student_features (
                student_id, user_id, enrollment_year, total_courses_enrolled, courses_completed,
                courses_abandoned, avg_score_overall, score_trend, total_active_days,
                days_since_last_activity, avg_weekly_events, avg_session_gap_days,
                late_submission_rate, label_at_fault, label_dropout, refreshed_at
            ) VALUES`,
            studentFeatureRows.slice(i, i + studentBatchSize)
        );
    }
};

const run = async () => {
    await client.connect();

    try {
        await client.query(
            'TRUNCATE TABLE ml_student_course_features, ml_student_features, lms_events, lms_enrollments, lms_courses, lms_students, lms_teachers RESTART IDENTITY CASCADE'
        );

        await seedStudentsData();
        await seedTeachersData();
        await seedCoursesData();
        await seedEnrollmentsData();
        await seedEventsData();
        await seedMLStudentFeatureData();
    } finally {
        await client.end();
    }
};

run();



