const fs = require('fs');
const path = require('path');

// Database file path
const DB_PATH = path.join(__dirname, '..', 'data', 'database.json');

// Helper to generate IDs
function generateId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Initialize database
function initDatabase() {
    const dataDir = path.join(__dirname, '..', 'data');

    // Create data directory if it doesn't exist
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    // Create initial database structure if it doesn't exist
    if (!fs.existsSync(DB_PATH)) {
        const initialData = {
            users: [],
            admins: [],
            competitions: [],
            competition_participants: [],
            measurements: [],
            testimonials: [],
            notifications: []
        };
        fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
        console.log('✅ Local database initialized');
    }
}

// Read database
function readDatabase() {
    if (!fs.existsSync(DB_PATH)) {
        initDatabase();
    }
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
}

// Write database
function writeDatabase(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

class Database {
    // Users
    static createUser(userData) {
        const db = readDatabase();
        const user = {
            id: generateId('user'),
            ...userData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        db.users.push(user);
        writeDatabase(db);
        return user;
    }

    static getUserByEmail(email) {
        const db = readDatabase();
        return db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    }

    static getUserById(id) {
        const db = readDatabase();
        return db.users.find(u => u.id === id);
    }

    static getAllUsers() {
        const db = readDatabase();
        return db.users;
    }

    static updateUser(id, updates) {
        const db = readDatabase();
        const index = db.users.findIndex(u => u.id === id);
        if (index !== -1) {
            db.users[index] = {
                ...db.users[index],
                ...updates,
                updated_at: new Date().toISOString()
            };
            writeDatabase(db);
            return db.users[index];
        }
        return null;
    }

    static deleteUser(id) {
        const db = readDatabase();
        db.users = db.users.filter(u => u.id !== id);
        writeDatabase(db);
    }

    // Admins
    static createAdmin(adminData) {
        const db = readDatabase();
        const admin = {
            id: generateId('admin'),
            ...adminData,
            created_at: new Date().toISOString()
        };
        db.admins.push(admin);
        writeDatabase(db);
        return admin;
    }

    static getAdminByEmail(email) {
        const db = readDatabase();
        return db.admins.find(a => a.email.toLowerCase() === email.toLowerCase());
    }

    static getAllAdmins() {
        const db = readDatabase();
        return db.admins;
    }

    static updateAdmin(id, updates) {
        const db = readDatabase();
        const index = db.admins.findIndex(a => a.id === id);
        if (index !== -1) {
            db.admins[index] = { ...db.admins[index], ...updates };
            writeDatabase(db);
            return db.admins[index];
        }
        return null;
    }

    static deleteAdmin(id) {
        const db = readDatabase();
        db.admins = db.admins.filter(a => a.id !== id);
        writeDatabase(db);
    }

    // Competitions
    static createCompetition(competitionData) {
        const db = readDatabase();
        const competition = {
            id: generateId('comp'),
            ...competitionData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        db.competitions.push(competition);
        writeDatabase(db);
        return competition;
    }

    static getCompetitionById(id) {
        const db = readDatabase();
        return db.competitions.find(c => c.id === id);
    }

    static getAllCompetitions() {
        const db = readDatabase();
        return db.competitions;
    }

    static getPublicCompetitions() {
        const db = readDatabase();
        return db.competitions.filter(c => c.is_public);
    }

    static updateCompetition(id, updates) {
        const db = readDatabase();
        const index = db.competitions.findIndex(c => c.id === id);
        if (index !== -1) {
            db.competitions[index] = {
                ...db.competitions[index],
                ...updates,
                updated_at: new Date().toISOString()
            };
            writeDatabase(db);
            return db.competitions[index];
        }
        return null;
    }

    // Competition Participants
    static addParticipant(competitionId, userId, approved = false) {
        const db = readDatabase();
        const participant = {
            id: generateId('part'),
            competition_id: competitionId,
            user_id: userId,
            approved,
            joined_at: new Date().toISOString()
        };
        db.competition_participants.push(participant);
        writeDatabase(db);
        return participant;
    }

    static getCompetitionParticipants(competitionId) {
        const db = readDatabase();
        const participants = db.competition_participants.filter(
            p => p.competition_id === competitionId
        );

        // Join with user data
        return participants.map(p => {
            const user = db.users.find(u => u.id === p.user_id);
            return {
                ...p,
                display_name: user?.display_name,
                real_name: user?.real_name,
                email: user?.email
            };
        });
    }

    static removeParticipant(competitionId, userId) {
        const db = readDatabase();
        db.competition_participants = db.competition_participants.filter(
            p => !(p.competition_id === competitionId && p.user_id === userId)
        );
        writeDatabase(db);
    }

    // Measurements
    static createMeasurement(measurementData) {
        const db = readDatabase();
        const measurement = {
            id: generateId('meas'),
            ...measurementData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        db.measurements.push(measurement);
        writeDatabase(db);
        return measurement;
    }

    static getUserMeasurements(userId, competitionId = null) {
        const db = readDatabase();
        let measurements = db.measurements.filter(m => m.user_id === userId);
        if (competitionId) {
            measurements = measurements.filter(m => m.competition_id === competitionId);
        }
        return measurements.sort((a, b) =>
            new Date(b.measurement_date) - new Date(a.measurement_date)
        );
    }

    static updateMeasurement(id, updates) {
        const db = readDatabase();
        const index = db.measurements.findIndex(m => m.id === id);
        if (index !== -1) {
            db.measurements[index] = {
                ...db.measurements[index],
                ...updates,
                updated_at: new Date().toISOString()
            };
            writeDatabase(db);
            return db.measurements[index];
        }
        return null;
    }

    static deleteMeasurement(id) {
        const db = readDatabase();
        db.measurements = db.measurements.filter(m => m.id !== id);
        writeDatabase(db);
    }

    // Testimonials
    static createTestimonial(testimonialData) {
        const db = readDatabase();
        const testimonial = {
            id: generateId('test'),
            ...testimonialData,
            status: 'pending',
            created_at: new Date().toISOString()
        };
        db.testimonials.push(testimonial);
        writeDatabase(db);
        return testimonial;
    }

    static getAllTestimonials() {
        const db = readDatabase();
        // Join with user and competition data
        return db.testimonials.map(t => {
            const user = db.users.find(u => u.id === t.user_id);
            const competition = db.competitions.find(c => c.id === t.competition_id);
            return {
                ...t,
                display_name: user?.display_name,
                real_name: user?.real_name,
                competition_name: competition?.name
            };
        });
    }

    static getApprovedTestimonials() {
        const db = readDatabase();
        const approved = db.testimonials.filter(t => t.status === 'approved');
        return approved.map(t => {
            const user = db.users.find(u => u.id === t.user_id);
            const competition = db.competitions.find(c => c.id === t.competition_id);
            return {
                ...t,
                display_name: user?.display_name,
                real_name: user?.real_name,
                competition_name: competition?.name
            };
        });
    }

    static updateTestimonial(id, updates) {
        const db = readDatabase();
        const index = db.testimonials.findIndex(t => t.id === id);
        if (index !== -1) {
            db.testimonials[index] = { ...db.testimonials[index], ...updates };
            writeDatabase(db);
            return db.testimonials[index];
        }
        return null;
    }

    static deleteTestimonial(id) {
        const db = readDatabase();
        db.testimonials = db.testimonials.filter(t => t.id !== id);
        writeDatabase(db);
    }

    // Notifications
    static createNotification(notificationData) {
        const db = readDatabase();
        const notification = {
            id: generateId('notif'),
            ...notificationData,
            read: false,
            created_at: new Date().toISOString()
        };
        db.notifications.push(notification);
        writeDatabase(db);
        return notification;
    }

    static getUserNotifications(userId) {
        const db = readDatabase();
        return db.notifications
            .filter(n => n.user_id === userId)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    static markNotificationAsRead(id) {
        const db = readDatabase();
        const index = db.notifications.findIndex(n => n.id === id);
        if (index !== -1) {
            db.notifications[index].read = true;
            writeDatabase(db);
        }
    }
}

module.exports = { Database, initDatabase };
