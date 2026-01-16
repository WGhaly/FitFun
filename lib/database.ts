import { sql } from '@vercel/postgres';

export class Database {
    // Helper to execute queries
    static async query(text: string, params?: any[]) {
        try {
            const result = await sql.query(text, params);
            return result;
        } catch (error) {
            console.error('Database query error:', error);
            throw error;
        }
    }

    // Users
    static async createUser(userData: any) {
        const {
            email,
            passwordHash,
            realName,
            displayName,
            weight,
            height,
            country,
            city
        } = userData;

        const result = await this.query(
            `INSERT INTO users (email, password_hash, real_name, display_name, weight, height, country, city)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
            [email, passwordHash, realName, displayName, weight, height, country, city]
        );

        return result.rows[0];
    }

    static async getUserByEmail(email: string) {
        const result = await this.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        return result.rows[0];
    }

    static async getUserById(id: string) {
        const result = await this.query(
            'SELECT * FROM users WHERE id = $1',
            [id]
        );
        return result.rows[0];
    }

    static async getAllUsers() {
        const result = await this.query('SELECT * FROM users ORDER BY created_at DESC');
        return result.rows;
    }

    static async updateUser(id: string, updates: any) {
        const fields = Object.keys(updates);
        const values = Object.values(updates);
        const setClause = fields.map((field, i) => `${field} = $${i + 2}`).join(', ');

        const result = await this.query(
            `UPDATE users SET ${setClause} WHERE id = $1 RETURNING *`,
            [id, ...values]
        );

        return result.rows[0];
    }

    static async deleteUser(id: string) {
        await this.query('DELETE FROM users WHERE id = $1', [id]);
    }

    // Admins
    static async createAdmin(adminData: any) {
        const { email, passwordHash, role, name, createdBy } = adminData;

        const result = await this.query(
            `INSERT INTO admins (email, password_hash, role, name, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
            [email, passwordHash, role, name, createdBy]
        );

        return result.rows[0];
    }

    static async getAdminByEmail(email: string) {
        const result = await this.query(
            'SELECT * FROM admins WHERE email = $1',
            [email]
        );
        return result.rows[0];
    }

    static async getAllAdmins() {
        const result = await this.query('SELECT * FROM admins ORDER BY created_at DESC');
        return result.rows;
    }

    static async updateAdmin(id: string, updates: any) {
        const fields = Object.keys(updates);
        const values = Object.values(updates);
        const setClause = fields.map((field, i) => `${field} = $${i + 2}`).join(', ');

        const result = await this.query(
            `UPDATE admins SET ${setClause} WHERE id = $1 RETURNING *`,
            [id, ...values]
        );

        return result.rows[0];
    }

    static async deleteAdmin(id: string) {
        await this.query('DELETE FROM admins WHERE id = $1', [id]);
    }

    // Competitions
    static async createCompetition(competitionData: any) {
        const {
            name,
            description,
            creatorId,
            isPublic,
            joinMode,
            maxParticipants,
            startDate,
            duration,
            measurementMethod,
            prizeDescription,
            winnerDistribution
        } = competitionData;

        const result = await this.query(
            `INSERT INTO competitions (
        name, description, creator_id, is_public, join_mode, max_participants,
        start_date, duration, measurement_method, prize_description, winner_distribution
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
            [
                name, description, creatorId, isPublic, joinMode, maxParticipants,
                startDate, duration, measurementMethod, prizeDescription, winnerDistribution
            ]
        );

        return result.rows[0];
    }

    static async getCompetitionById(id: string) {
        const result = await this.query(
            'SELECT * FROM competitions WHERE id = $1',
            [id]
        );
        return result.rows[0];
    }

    static async getAllCompetitions() {
        const result = await this.query('SELECT * FROM competitions ORDER BY created_at DESC');
        return result.rows;
    }

    static async getPublicCompetitions() {
        const result = await this.query(
            'SELECT * FROM competitions WHERE is_public = TRUE ORDER BY created_at DESC'
        );
        return result.rows;
    }

    static async updateCompetition(id: string, updates: any) {
        const fields = Object.keys(updates);
        const values = Object.values(updates);
        const setClause = fields.map((field, i) => `${field} = $${i + 2}`).join(', ');

        const result = await this.query(
            `UPDATE competitions SET ${setClause} WHERE id = $1 RETURNING *`,
            [id, ...values]
        );

        return result.rows[0];
    }

    // Competition Participants
    static async addParticipant(competitionId: string, userId: string, approved: boolean = false) {
        const result = await this.query(
            `INSERT INTO competition_participants (competition_id, user_id, approved)
       VALUES ($1, $2, $3)
       RETURNING *`,
            [competitionId, userId, approved]
        );

        return result.rows[0];
    }

    static async getCompetitionParticipants(competitionId: string) {
        const result = await this.query(
            `SELECT cp.*, u.display_name, u.real_name, u.email
       FROM competition_participants cp
       JOIN users u ON cp.user_id = u.id
       WHERE cp.competition_id = $1`,
            [competitionId]
        );
        return result.rows;
    }

    static async removeParticipant(competitionId: string, userId: string) {
        await this.query(
            'DELETE FROM competition_participants WHERE competition_id = $1 AND user_id = $2',
            [competitionId, userId]
        );
    }

    // Measurements
    static async createMeasurement(measurementData: any) {
        const { userId, competitionId, weight, bodyFatPercentage, bmi, measurementDate } = measurementData;

        const result = await this.query(
            `INSERT INTO measurements (user_id, competition_id, weight, body_fat_percentage, bmi, measurement_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
            [userId, competitionId, weight, bodyFatPercentage, bmi, measurementDate]
        );

        return result.rows[0];
    }

    static async getUserMeasurements(userId: string, competitionId?: string) {
        if (competitionId) {
            const result = await this.query(
                'SELECT * FROM measurements WHERE user_id = $1 AND competition_id = $2 ORDER BY measurement_date DESC',
                [userId, competitionId]
            );
            return result.rows;
        }

        const result = await this.query(
            'SELECT * FROM measurements WHERE user_id = $1 ORDER BY measurement_date DESC',
            [userId]
        );
        return result.rows;
    }

    // Testimonials
    static async createTestimonial(testimonialData: any) {
        const { userId, competitionId, text, weightLost } = testimonialData;

        const result = await this.query(
            `INSERT INTO testimonials (user_id, competition_id, text, weight_lost)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
            [userId, competitionId, text, weightLost]
        );

        return result.rows[0];
    }

    static async getAllTestimonials() {
        const result = await this.query(
            `SELECT t.*, u.display_name, u.real_name, c.name as competition_name
       FROM testimonials t
       JOIN users u ON t.user_id = u.id
       JOIN competitions c ON t.competition_id = c.id
       ORDER BY t.created_at DESC`
        );
        return result.rows;
    }

    static async getApprovedTestimonials() {
        const result = await this.query(
            `SELECT t.*, u.display_name, u.real_name, c.name as competition_name
       FROM testimonials t
       JOIN users u ON t.user_id = u.id
       JOIN competitions c ON t.competition_id = c.id
       WHERE t.status = 'approved'
       ORDER BY t.created_at DESC`
        );
        return result.rows;
    }

    static async updateTestimonial(id: string, updates: any) {
        const fields = Object.keys(updates);
        const values = Object.values(updates);
        const setClause = fields.map((field, i) => `${field} = $${i + 2}`).join(', ');

        const result = await this.query(
            `UPDATE testimonials SET ${setClause} WHERE id = $1 RETURNING *`,
            [id, ...values]
        );

        return result.rows[0];
    }

    static async deleteTestimonial(id: string) {
        await this.query('DELETE FROM testimonials WHERE id = $1', [id]);
    }

    // Notifications
    static async createNotification(notificationData: any) {
        const { userId, type, title, message } = notificationData;

        const result = await this.query(
            `INSERT INTO notifications (user_id, type, title, message)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
            [userId, type, title, message]
        );

        return result.rows[0];
    }

    static async getUserNotifications(userId: string) {
        const result = await this.query(
            'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        return result.rows;
    }

    static async markNotificationAsRead(id: string) {
        await this.query(
            'UPDATE notifications SET read = TRUE WHERE id = $1',
            [id]
        );
    }
}
