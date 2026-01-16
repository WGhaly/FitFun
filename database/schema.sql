-- FitFun Database Schema for Vercel Postgres
-- Run this script to create all necessary tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    real_name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    profile_image TEXT,
    weight DECIMAL(5, 2),
    height DECIMAL(5, 2),
    bmi DECIMAL(5, 2),
    body_fat_percentage DECIMAL(5, 2),
    muscle_mass_percentage DECIMAL(5, 2),
    before_image TEXT,
    after_image TEXT,
    country VARCHAR(255),
    city VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin', -- 'admin' or 'super_admin'
    name VARCHAR(255) NOT NULL,
    must_reset_password BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES admins(id) ON DELETE SET NULL
);

-- Competitions table
CREATE TABLE IF NOT EXISTS competitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    creator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_public BOOLEAN DEFAULT TRUE,
    join_mode VARCHAR(50) DEFAULT 'free', -- 'free' or 'approval'
    max_participants INTEGER,
    start_date TIMESTAMP NOT NULL,
    duration INTEGER NOT NULL, -- in days
    measurement_method VARCHAR(50) NOT NULL, -- 'absolute', 'percentage', 'bmi', 'bodyfat'
    prize_description TEXT,
    winner_distribution VARCHAR(50) DEFAULT '1st', -- '1st', '1st+2nd', '1st+2nd+3rd'
    status VARCHAR(50) DEFAULT 'upcoming', -- 'upcoming', 'active', 'grace_period', 'completed', 'canceled'
    winners JSONB, -- Store winner data as JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Competition participants junction table
CREATE TABLE IF NOT EXISTS competition_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved BOOLEAN DEFAULT FALSE,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP,
    UNIQUE(competition_id, user_id)
);

-- Measurements table
CREATE TABLE IF NOT EXISTS measurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
    weight DECIMAL(5, 2) NOT NULL,
    body_fat_percentage DECIMAL(5, 2),
    bmi DECIMAL(5, 2),
    measurement_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    weight_lost DECIMAL(5, 2),
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'hidden'
    approved_at TIMESTAMP,
    approved_by UUID REFERENCES admins(id) ON DELETE SET NULL,
    hidden_at TIMESTAMP,
    hidden_by UUID REFERENCES admins(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'join_request', 'approval', 'rejection', 'reminder', etc.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competitions_updated_at BEFORE UPDATE ON competitions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_measurements_updated_at BEFORE UPDATE ON measurements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
