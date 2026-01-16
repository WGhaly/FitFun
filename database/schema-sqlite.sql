-- FitFun Database Schema for SQLite
-- This is compatible with both SQLite (local) and PostgreSQL (production)

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    real_name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    profile_image TEXT,
    weight REAL,
    height REAL,
    bmi REAL,
    body_fat_percentage REAL,
    muscle_mass_percentage REAL,
    before_image TEXT,
    after_image TEXT,
    country TEXT,
    city TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    name TEXT NOT NULL,
    must_reset_password INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT REFERENCES admins(id) ON DELETE SET NULL
);

-- Competitions table
CREATE TABLE IF NOT EXISTS competitions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    creator_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    is_public INTEGER DEFAULT 1,
    join_mode TEXT DEFAULT 'free',
    max_participants INTEGER,
    start_date TEXT NOT NULL,
    duration INTEGER NOT NULL,
    measurement_method TEXT NOT NULL,
    prize_description TEXT,
    winner_distribution TEXT DEFAULT '1st',
    status TEXT DEFAULT 'upcoming',
    winners TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Competition participants junction table
CREATE TABLE IF NOT EXISTS competition_participants (
    id TEXT PRIMARY KEY,
    competition_id TEXT REFERENCES competitions(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    joined_at TEXT DEFAULT CURRENT_TIMESTAMP,
    approved INTEGER DEFAULT 0,
    approved_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    approved_at TEXT,
    UNIQUE(competition_id, user_id)
);

-- Measurements table
CREATE TABLE IF NOT EXISTS measurements (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    competition_id TEXT REFERENCES competitions(id) ON DELETE CASCADE,
    weight REAL NOT NULL,
    body_fat_percentage REAL,
    bmi REAL,
    measurement_date TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    competition_id TEXT REFERENCES competitions(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    weight_lost REAL,
    status TEXT DEFAULT 'pending',
    approved_at TEXT,
    approved_by TEXT REFERENCES admins(id) ON DELETE SET NULL,
    hidden_at TEXT,
    hidden_by TEXT REFERENCES admins(id) ON DELETE SET NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_competitions_status ON competitions(status);
CREATE INDEX IF NOT EXISTS idx_competitions_creator ON competitions(creator_id);
CREATE INDEX IF NOT EXISTS idx_competition_participants_comp ON competition_participants(competition_id);
CREATE INDEX IF NOT EXISTS idx_competition_participants_user ON competition_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_measurements_user ON measurements(user_id);
CREATE INDEX IF NOT EXISTS idx_measurements_competition ON measurements(competition_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_status ON testimonials(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
