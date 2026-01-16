-- Seed data for development and testing
-- Run this after schema.sql

-- Insert super admin (password: Admin123!)
-- Password hash generated with bcrypt, rounds=10
INSERT INTO admins (id, email, password_hash, role, name, must_reset_password, created_at)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin@fitfun.com',
    '$2a$10$rKZhQhJ9xqJX8qGZqYqZ5.xQZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5', -- Admin123!
    'super_admin',
    'Super Admin',
    FALSE,
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO NOTHING;

-- Insert demo users
INSERT INTO users (id, email, password_hash, role, real_name, display_name, weight, height, country, city, created_at)
VALUES
(
    '10000000-0000-0000-0000-000000000001',
    'john@example.com',
    '$2a$10$rKZhQhJ9xqJX8qGZqYqZ5.xQZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5', -- Password123!
    'user',
    'John Doe',
    'JohnD',
    85.0,
    175.0,
    'United States',
    'New York',
    CURRENT_TIMESTAMP
),
(
    '10000000-0000-0000-0000-000000000002',
    'sarah@example.com',
    '$2a$10$rKZhQhJ9xqJX8qGZqYqZ5.xQZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5', -- Password123!
    'user',
    'Sarah Smith',
    'SarahFit',
    70.0,
    165.0,
    'United States',
    'Los Angeles',
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO NOTHING;

-- Insert demo competition
INSERT INTO competitions (id, name, description, creator_id, is_public, join_mode, max_participants, start_date, duration, measurement_method, prize_description, winner_distribution, status, created_at)
VALUES (
    '20000000-0000-0000-0000-000000000001',
    'Summer Weight Loss Challenge',
    'Join us for a 12-week transformation journey!',
    '10000000-0000-0000-0000-000000000001',
    TRUE,
    'free',
    50,
    CURRENT_TIMESTAMP + INTERVAL '7 days',
    84,
    'percentage',
    'Winner gets a fitness tracker and gym membership!',
    '1st+2nd+3rd',
    'upcoming',
    CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO NOTHING;

-- Add participants to competition
INSERT INTO competition_participants (competition_id, user_id, approved, joined_at)
VALUES
(
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    TRUE,
    CURRENT_TIMESTAMP
),
(
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000002',
    TRUE,
    CURRENT_TIMESTAMP
)
ON CONFLICT (competition_id, user_id) DO NOTHING;

-- Insert demo testimonials
INSERT INTO testimonials (id, user_id, competition_id, text, weight_lost, status, created_at)
VALUES
(
    '30000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    'This competition completely changed my life! I lost 15kg and feel amazing. The community support was incredible and kept me motivated throughout the journey.',
    15.0,
    'pending',
    CURRENT_TIMESTAMP - INTERVAL '2 days'
),
(
    '30000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000001',
    'Best decision I ever made! The structured approach and friendly competition helped me stay on track. Down 10kg and counting!',
    10.0,
    'approved',
    CURRENT_TIMESTAMP - INTERVAL '5 days'
)
ON CONFLICT (id) DO NOTHING;

-- Update approved testimonial
UPDATE testimonials
SET approved_at = CURRENT_TIMESTAMP - INTERVAL '4 days',
    approved_by = '00000000-0000-0000-0000-000000000001'
WHERE id = '30000000-0000-0000-0000-000000000002';
