const { sql } = require('@vercel/postgres');

// Helper to generate IDs
function generateId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

class Database {
    // Users
    static async createUser(userData) {
        const id = generateId('user');
        const now = new Date().toISOString();

        const result = await sql`
            INSERT INTO users (
                id, email, password_hash, role, real_name, display_name,
                weight, height, bmi, country, city, created_at, updated_at
            ) VALUES (
                ${id}, ${userData.email}, ${userData.password_hash}, ${userData.role || 'user'},
                ${userData.real_name}, ${userData.display_name}, ${userData.weight}, ${userData.height},
                ${userData.bmi}, ${userData.country}, ${userData.city}, ${now}, ${now}
            ) RETURNING *
        `;

        return result.rows[0];
    }

    static async getUserByEmail(email) {
        const result = await sql`SELECT * FROM users WHERE LOWER(email) = LOWER(${email})`;
        return result.rows[0];
    }

    static async getUserById(id) {
        const result = await sql`SELECT * FROM users WHERE id = ${id}`;
        return result.rows[0];
    }

    static async getAllUsers() {
        const result = await sql`SELECT * FROM users ORDER BY created_at DESC`;
        return result.rows;
    }

    static async updateUser(id, updates) {
        const now = new Date().toISOString();
        const fields = [];
        const values = [];

        Object.keys(updates).forEach(key => {
            fields.push(`${key} = $${fields.length + 2}`);
            values.push(updates[key]);
        });

        fields.push(`updated_at = $${fields.length + 2}`);
        values.push(now);

        const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $1 RETURNING *`;
        const result = await sql.query(query, [id, ...values]);

        return result.rows[0];
    }

    static async deleteUser(id) {
        await sql`DELETE FROM users WHERE id = ${id}`;
    }

    // Admins
    static async createAdmin(adminData) {
        const id = generateId('admin');
        const now = new Date().toISOString();

        const result = await sql`
            INSERT INTO admins (
                id, email, password_hash, role, name, must_reset_password, created_at, created_by
            ) VALUES (
                ${id}, ${adminData.email}, ${adminData.password_hash}, ${adminData.role || 'admin'},
                ${adminData.name}, ${adminData.must_reset_password !== false}, ${now}, ${adminData.created_by || null}
            ) RETURNING *
        `;

        return result.rows[0];
    }

    static async getAdminByEmail(email) {
        const result = await sql`SELECT * FROM admins WHERE LOWER(email) = LOWER(${email})`;
        return result.rows[0];
    }

    static async getAllAdmins() {
        const result = await sql`SELECT * FROM admins ORDER BY created_at DESC`;
        return result.rows;
    }

    static async updateAdmin(id, updates) {
        const fields = [];
        const values = [];

        Object.keys(updates).forEach(key => {
            fields.push(`${key} = $${fields.length + 2}`);
            values.push(updates[key]);
        });

        const query = `UPDATE admins SET ${fields.join(', ')} WHERE id = $1 RETURNING *`;
        const result = await sql.query(query, [id, ...values]);

        return result.rows[0];
    }

    static async deleteAdmin(id) {
        await sql`DELETE FROM admins WHERE id = ${id}`;
    }

    // Competitions
    static async createCompetition(competitionData) {
        const id = generateId('comp');
        const now = new Date().toISOString();

        const result = await sql`
            INSERT INTO competitions (
                id, name, description, creator_id, is_public, join_mode, max_participants,
                start_date, duration, measurement_method, prize_description, winner_distribution,
                status, created_at, updated_at
            ) VALUES (
                ${id}, ${competitionData.name}, ${competitionData.description}, ${competitionData.creator_id},
                ${competitionData.is_public !== false}, ${competitionData.join_mode || 'free'},
                ${competitionData.max_participants}, ${competitionData.start_date}, ${competitionData.duration},
                ${competitionData.measurement_method}, ${competitionData.prize_description},
                ${competitionData.winner_distribution || '1st'}, ${competitionData.status || 'upcoming'},
                ${now}, ${now}
            ) RETURNING *
        `;

        return result.rows[0];
    }

    static async getCompetitionById(id) {
        const result = await sql`SELECT * FROM competitions WHERE id = ${id}`;
        return result.rows[0];
    }

    static async getAllCompetitions() {
        const result = await sql`SELECT * FROM competitions ORDER BY created_at DESC`;
        return result.rows;
    }

    static async getPublicCompetitions() {
        const result = await sql`SELECT * FROM competitions WHERE is_public = true ORDER BY created_at DESC`;
        return result.rows;
    }

    static async updateCompetition(id, updates) {
        const now = new Date().toISOString();
        const fields = [];
        const values = [];

        Object.keys(updates).forEach(key => {
            fields.push(`${key} = $${fields.length + 2}`);
            values.push(updates[key]);
        });

        fields.push(`updated_at = $${fields.length + 2}`);
        values.push(now);

        const query = `UPDATE competitions SET ${fields.join(', ')} WHERE id = $1 RETURNING *`;
        const result = await sql.query(query, [id, ...values]);

        return result.rows[0];
    }

    // Competition Participants
    static async addParticipant(competitionId, userId, approved = false) {
        const id = generateId('part');
        const now = new Date().toISOString();

        const result = await sql`
            INSERT INTO competition_participants (id, competition_id, user_id, approved, joined_at)
            VALUES (${id}, ${competitionId}, ${userId}, ${approved}, ${now})
            RETURNING *
        `;

        return result.rows[0];
    }

    static async getCompetitionParticipants(competitionId) {
        const result = await sql`
            SELECT cp.*, u.display_name, u.real_name, u.email
            FROM competition_participants cp
            JOIN users u ON cp.user_id = u.id
            WHERE cp.competition_id = ${competitionId}
        `;
        return result.rows;
    }

    static async removeParticipant(competitionId, userId) {
        await sql`
            DELETE FROM competition_participants
            WHERE competition_id = ${competitionId} AND user_id = ${userId}
        `;
    }

    // Measurements
    static async createMeasurement(measurementData) {
        const id = generateId('meas');
        const now = new Date().toISOString();

        const result = await sql`
            INSERT INTO measurements (
                id, user_id, competition_id, weight, body_fat_percentage, bmi,
                measurement_date, created_at, updated_at
            ) VALUES (
                ${id}, ${measurementData.user_id}, ${measurementData.competition_id},
                ${measurementData.weight}, ${measurementData.body_fat_percentage}, ${measurementData.bmi},
                ${measurementData.measurement_date}, ${now}, ${now}
            ) RETURNING *
        `;

        return result.rows[0];
    }

    static async getUserMeasurements(userId, competitionId = null) {
        if (competitionId) {
            const result = await sql`
                SELECT * FROM measurements
                WHERE user_id = ${userId} AND competition_id = ${competitionId}
                ORDER BY measurement_date DESC
            `;
            return result.rows;
        }

        const result = await sql`
            SELECT * FROM measurements
            WHERE user_id = ${userId}
            ORDER BY measurement_date DESC
        `;
        return result.rows;
    }

    // Testimonials
    static async createTestimonial(testimonialData) {
        const id = generateId('test');
        const now = new Date().toISOString();

        const result = await sql`
            INSERT INTO testimonials (id, user_id, competition_id, text, weight_lost, status, created_at)
            VALUES (${id}, ${testimonialData.user_id}, ${testimonialData.competition_id},
                    ${testimonialData.text}, ${testimonialData.weight_lost}, 'pending', ${now})
            RETURNING *
        `;

        return result.rows[0];
    }

    static async getAllTestimonials() {
        const result = await sql`
            SELECT t.*, u.display_name, u.real_name, c.name as competition_name
            FROM testimonials t
            JOIN users u ON t.user_id = u.id
            JOIN competitions c ON t.competition_id = c.id
            ORDER BY t.created_at DESC
        `;
        return result.rows;
    }

    static async getApprovedTestimonials() {
        const result = await sql`
            SELECT t.*, u.display_name, u.real_name, c.name as competition_name
            FROM testimonials t
            JOIN users u ON t.user_id = u.id
            JOIN competitions c ON t.competition_id = c.id
            WHERE t.status = 'approved'
            ORDER BY t.created_at DESC
        `;
        return result.rows;
    }

    static async updateTestimonial(id, updates) {
        const fields = [];
        const values = [];

        Object.keys(updates).forEach(key => {
            fields.push(`${key} = $${fields.length + 2}`);
            values.push(updates[key]);
        });

        const query = `UPDATE testimonials SET ${fields.join(', ')} WHERE id = $1 RETURNING *`;
        const result = await sql.query(query, [id, ...values]);

        return result.rows[0];
    }

    static async deleteTestimonial(id) {
        await sql`DELETE FROM testimonials WHERE id = ${id}`;
    }

    // Notifications
    static async createNotification(notificationData) {
        const id = generateId('notif');
        const now = new Date().toISOString();

        const result = await sql`
            INSERT INTO notifications (id, user_id, type, title, message, read, created_at)
            VALUES (${id}, ${notificationData.user_id}, ${notificationData.type},
                    ${notificationData.title}, ${notificationData.message}, false, ${now})
            RETURNING *
        `;

        return result.rows[0];
    }

    static async getUserNotifications(userId) {
        const result = await sql`
            SELECT * FROM notifications
            WHERE user_id = ${userId}
            ORDER BY created_at DESC
        `;
        return result.rows;
    }

    static async markNotificationAsRead(id) {
        await sql`UPDATE notifications SET read = true WHERE id = ${id}`;
    }
}

module.exports = { Database };
