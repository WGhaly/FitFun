const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

console.log('🌱 Seeding database...\n');

// Open database
const dbPath = path.join(__dirname, '..', 'data', 'fitfun.db');
const db = new Database(dbPath);

// Helper to generate IDs
function generateId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Hash password
const hashPassword = (password) => bcrypt.hashSync(password, 10);

console.log('👤 Creating users...\n');

// Insert super admin
const superAdminId = 'admin_super_1';
db.prepare(`
    INSERT OR REPLACE INTO admins (id, email, password_hash, role, name, must_reset_password, created_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
`).run(
    superAdminId,
    'admin@fitfun.com',
    hashPassword('Admin123!'),
    'super_admin',
    'Super Admin',
    0
);
console.log('✅ Created super admin: admin@fitfun.com / Admin123!');

// Insert demo users
const user1Id = 'user_john_1';
const user2Id = 'user_sarah_1';

db.prepare(`
    INSERT OR REPLACE INTO users (id, email, password_hash, role, real_name, display_name, weight, height, country, city, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
`).run(
    user1Id,
    'john@example.com',
    hashPassword('Password123!'),
    'user',
    'John Doe',
    'JohnD',
    85.0,
    175.0,
    'United States',
    'New York'
);
console.log('✅ Created user: john@example.com / Password123!');

db.prepare(`
    INSERT OR REPLACE INTO users (id, email, password_hash, role, real_name, display_name, weight, height, country, city, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
`).run(
    user2Id,
    'sarah@example.com',
    hashPassword('Password123!'),
    'user',
    'Sarah Smith',
    'SarahFit',
    70.0,
    165.0,
    'United States',
    'Los Angeles'
);
console.log('✅ Created user: sarah@example.com / Password123!');

console.log('\n🏆 Creating competitions...\n');

// Insert demo competition
const compId = 'comp_summer_1';
const startDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

db.prepare(`
    INSERT OR REPLACE INTO competitions (
        id, name, description, creator_id, is_public, join_mode, max_participants,
        start_date, duration, measurement_method, prize_description, winner_distribution,
        status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
`).run(
    compId,
    'Summer Weight Loss Challenge',
    'Join us for a 12-week transformation journey!',
    user1Id,
    1,
    'free',
    50,
    startDate,
    84,
    'percentage',
    'Winner gets a fitness tracker and gym membership!',
    '1st+2nd+3rd',
    'upcoming'
);
console.log('✅ Created competition: Summer Weight Loss Challenge');

// Add participants
db.prepare(`
    INSERT OR REPLACE INTO competition_participants (id, competition_id, user_id, approved, joined_at)
    VALUES (?, ?, ?, ?, datetime('now'))
`).run(generateId('part'), compId, user1Id, 1);

db.prepare(`
    INSERT OR REPLACE INTO competition_participants (id, competition_id, user_id, approved, joined_at)
    VALUES (?, ?, ?, ?, datetime('now'))
`).run(generateId('part'), compId, user2Id, 1);

console.log('✅ Added participants to competition');

console.log('\n💬 Creating testimonials...\n');

// Insert testimonials
const test1Id = 'test_1';
const test2Id = 'test_2';

db.prepare(`
    INSERT OR REPLACE INTO testimonials (id, user_id, competition_id, text, weight_lost, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now', '-2 days'))
`).run(
    test1Id,
    user1Id,
    compId,
    'This competition completely changed my life! I lost 15kg and feel amazing. The community support was incredible and kept me motivated throughout the journey.',
    15.0,
    'pending'
);
console.log('✅ Created pending testimonial');

db.prepare(`
    INSERT OR REPLACE INTO testimonials (id, user_id, competition_id, text, weight_lost, status, approved_at, approved_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now', '-1 day'), ?, datetime('now', '-2 days'))
`).run(
    test2Id,
    user2Id,
    compId,
    'Best decision I ever made! The structured approach and friendly competition helped me stay on track. Down 10kg and counting!',
    10.0,
    'approved',
    superAdminId
);
console.log('✅ Created approved testimonial');

db.close();

console.log('\n✅ Database seeded successfully!');
console.log('\n📝 Demo Credentials:');
console.log('   Admin: admin@fitfun.com / Admin123!');
console.log('   User 1: john@example.com / Password123!');
console.log('   User 2: sarah@example.com / Password123!');
console.log('\n💡 Next step: Run "npm run dev" to start the server');
