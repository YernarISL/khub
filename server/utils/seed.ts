import { Client } from 'pg';
import { faker } from '@faker-js/faker';

const client = new Client({
    user: 'lms_user',
    host: 'localhost',
    port: 5432,
    database: 'lms_db',
    password: 'lms_password'
});

// Seed data for students
const seedStudentsData = async () => {
    await client.connect();

    for (let i = 0; i < 2000; i++) {
        await client.query(
            `INSERT INTO lms_students (full_name, email, enrollment_year) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING`,
            [
                faker.person.fullName(),
                faker.internet.email().toLocaleLowerCase(),
                faker.number.int({ min: 2022, max: 2026 })
            ]
        );
    }

    await client.end();
}

seedStudentsData().catch(console.error);
